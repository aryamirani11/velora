import os
import httpx
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

load_dotenv()

WATSONX_API_KEY = os.getenv("WATSONX_API_KEY", "")
WATSONX_PROJECT_ID = os.getenv("WATSONX_PROJECT_ID", "")
WATSONX_URL = os.getenv("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")

iam_token = None
http_client = None


async def get_iam_token():
    global iam_token
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://iam.cloud.ibm.com/identity/token",
            data={
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                "apikey": WATSONX_API_KEY,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if resp.status_code == 200:
            iam_token = resp.json()["access_token"]
            return iam_token
        else:
            print(f"IAM token error: {resp.status_code} {resp.text}")
            return None


async def generate_text(prompt: str) -> Optional[str]:
    global iam_token
    if not iam_token:
        await get_iam_token()
    if not iam_token:
        return None

    url = f"{WATSONX_URL}/ml/v1/text/generation?version=2024-03-14"
    payload = {
        "model_id": "ibm/granite-13b-chat-v2",
        "input": prompt,
        "project_id": WATSONX_PROJECT_ID,
        "parameters": {
            "decoding_method": "greedy",
            "max_new_tokens": 1024,
            "temperature": 0.7,
            "top_p": 0.9,
            "repetition_penalty": 1.1,
        },
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            url,
            json=payload,
            headers={
                "Authorization": f"Bearer {iam_token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        )

        if resp.status_code == 401:
            await get_iam_token()
            if iam_token:
                resp = await client.post(
                    url,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {iam_token}",
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                )

        if resp.status_code == 200:
            data = resp.json()
            results = data.get("results", [])
            if results:
                return results[0].get("generated_text", "").strip()
        else:
            print(f"watsonx error: {resp.status_code} {resp.text}")

    return None


@asynccontextmanager
async def lifespan(app: FastAPI):
    if WATSONX_API_KEY:
        token = await get_iam_token()
        if token:
            print("Connected to IBM watsonx.ai")
        else:
            print("Failed to authenticate with IBM watsonx — using fallback responses")
    else:
        print("No WATSONX_API_KEY set — using fallback responses")
    yield


app = FastAPI(title="Velora API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are Velora, an empathetic AI chronic care assistant powered by IBM watsonx. You speak directly to patients and their caregivers in a warm, supportive tone.

You have access to the following patient data:
{patient_context}

Your guidelines:
1. Address the patient by first name — you are their care companion
2. Be clinically accurate but explain things in plain, accessible language
3. Reference specific vitals, labs, and medications from their data
4. Flag any abnormal values and explain what they mean simply
5. Provide actionable daily recommendations
6. When a value is concerning, reassure while being transparent
7. Suggest contacting their provider for clinical decisions
8. Use emoji sparingly (checkmarks, warning signs) for readability
9. Keep responses focused and well-structured with headers and bullets
10. Always end with encouragement — patients managing chronic conditions need it"""


class ChatRequest(BaseModel):
    message: str
    patient_id: Optional[str] = "p1"
    conversation_history: Optional[list] = None


class ChatResponse(BaseModel):
    response: str
    timeline_event: Optional[str] = None


PATIENTS_CONTEXT = {
    "p1": """Name: John Smith, 68M | Heart Failure (Stage C, EF 35%) + Hypertension
Vitals: BP 130/80, HR 72, Weight 80 kg, SpO2 96% | Allergies: Penicillin, Sulfa drugs
Meds: Lisinopril 20mg daily, Carvedilol 12.5mg BID, Furosemide 40mg daily, Spironolactone 25mg daily
Labs: BNP 450 pg/mL (HIGH), Creatinine 1.4, K+ 4.2, Na+ 138
Goals: Weight <81kg (met), BP <130/80 (met), Fluids <2L/day (met at 1.8L)
Team: Dr. Sarah Chen, Emergency: Mary Smith (Wife)
Trend: Weight 82.1→80.0 kg over 19 days. BP improving.""",

    "p2": """Name: Maria Garcia, 72F | Heart Failure (Stage B, EF 45%)
Vitals: BP 125/78, HR 68, Weight 65 kg, SpO2 97% | Allergies: Aspirin
Meds: Enalapril 10mg BID, Metoprolol 50mg daily, Aspirin 81mg daily
Labs: BNP 220 pg/mL (elevated), Creatinine 1.1, K+ 4.5, Na+ 140
Goals: Weight <66kg (met), BP <130/80 (met), Exercise >20min/day (NOT met - 15min)
Team: Dr. James Wu, Emergency: Carlos Garcia (Son)""",

    "p3": """Name: Robert Johnson, 55M | Heart Failure (Stage D, EF 20%) - CRITICAL
Vitals: BP 110/70, HR 88, Weight 92 kg, SpO2 93% | No allergies
Meds: Sacubitril/Valsartan 97/103mg BID, Carvedilol 25mg BID, Furosemide 80mg BID, Digoxin 0.125mg, Spironolactone 50mg
Labs: BNP 1200 (VERY HIGH), Creatinine 1.8 (HIGH), K+ 5.1 (HIGH), Na+ 132 (LOW)
Goals: Weight <90kg (NOT met - 92kg), BP >100/60 (met), Fluids <1.5L/day (NOT met - 2.1L)
Team: Dr. Sarah Chen, Emergency: Lisa Johnson (Daughter)""",

    "p4": """Name: Linda Williams, 61F | Hypertension (Uncontrolled)
Vitals: BP 158/95, HR 80, Weight 78 kg, SpO2 98% | Allergies: Lisinopril
Meds: Amlodipine 10mg daily, Losartan 100mg daily, HCTZ 25mg daily
Labs: Creatinine 1.0, K+ 3.8, Glucose 105, Cholesterol 245 (HIGH)
Goals: BP <140/90 (NOT met - 158/95), Exercise >30min/day (NOT met), Sodium <2g/day (NOT met)
Team: Dr. Amanda Foster, Emergency: David Williams (Husband)""",

    "p5": """Name: James Brown, 45M | Hypertension (Controlled)
Vitals: BP 128/82, HR 70, Weight 85 kg, SpO2 99% | No allergies
Meds: Lisinopril 10mg daily, Amlodipine 5mg daily
Labs: Creatinine 0.9, K+ 4.0, Glucose 95, Cholesterol 195
Goals: BP <130/80 (met), Exercise >30min/day (met at 35min), Weight <84kg (NOT met)
Team: Dr. Amanda Foster, Emergency: Karen Brown (Wife)""",

    "p6": """Name: Sarah Davis, 58F | Diabetes Type 2 (A1C 8.2%)
Vitals: BP 135/85, HR 76, Weight 88 kg, SpO2 98% | Allergies: Metformin (GI)
Meds: Ozempic 1mg weekly, Jardiance 25mg daily, Glipizide 10mg BID
Labs: A1C 8.2% (HIGH), Glucose 185 (HIGH), Creatinine 1.2, Triglycerides 210 (HIGH)
Goals: A1C <7.0% (NOT met), Fasting Glucose <130 (NOT met), Weight <85kg (NOT met)
Team: Dr. Priya Patel, Emergency: Tom Davis (Husband)""",

    "p7": """Name: Michael Wilson, 67M | Diabetes Type 2 (A1C 7.1%)
Vitals: BP 130/80, HR 72, Weight 82 kg, SpO2 98% | No allergies
Meds: Metformin 1000mg BID, Jardiance 10mg daily
Labs: A1C 7.1% (slightly above target), Glucose 140, Creatinine 1.0, Triglycerides 160
Goals: A1C <7.0% (NOT met), Fasting Glucose <130 (NOT met), Exercise >30min/day (NOT met - 25min)
Team: Dr. Priya Patel, Emergency: Janet Wilson (Wife)""",
}


@app.get("/api/health")
async def health():
    status = "connected" if iam_token else "fallback"
    return {"status": "ok", "watsonx": status}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    patient_ctx = PATIENTS_CONTEXT.get(request.patient_id, PATIENTS_CONTEXT["p1"])
    system = SYSTEM_PROMPT.format(patient_context=patient_ctx)

    prompt = f"<|system|>\n{system}\n"
    if request.conversation_history:
        for msg in request.conversation_history[-6:]:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            tag = "user" if role == "user" else "assistant"
            prompt += f"<|{tag}|>\n{content}\n"
    prompt += f"<|user|>\n{request.message}\n<|assistant|>\n"

    result = await generate_text(prompt)
    timeline_event = extract_timeline_event(request.message, result or "")

    if result:
        return ChatResponse(response=result, timeline_event=timeline_event)

    return ChatResponse(
        response=get_fallback_response(request.message, patient_ctx),
        timeline_event=timeline_event,
    )


def extract_timeline_event(user_message: str, response: str) -> Optional[str]:
    msg = user_message.lower()
    resp = response.lower()
    if any(w in msg for w in ["summary", "summarize", "report"]):
        return "Clinical summary generated"
    if any(w in msg for w in ["explain", "simple", "caregiver"]):
        return "Caregiver communication sent"
    if any(w in resp for w in ["elevated", "abnormal", "concern", "flag"]):
        return "Clinical finding flagged"
    if any(w in msg for w in ["recommend", "adjust", "medication"]):
        return "Treatment recommendation provided"
    if any(w in msg for w in ["how", "feeling", "status", "doing"]):
        return "Patient status assessed"
    return None


def get_fallback_response(message: str, patient_ctx: str) -> str:
    msg = message.lower()
    name = patient_ctx.split(",")[0].replace("Name: ", "").strip()
    first = name.split()[0]

    if any(w in msg for w in ["how", "status", "doing", "feeling", "overview"]):
        return (
            f"Based on the latest data for {name}:\n\n"
            "I've reviewed all vitals, labs, and current goals. "
            "Let me break it down for you — what specific area would you like to start with? "
            "I can look at vitals, medications, lab results, or your care goals."
        )
    if any(w in msg for w in ["vital", "blood pressure", "bp", "heart rate", "weight"]):
        return (
            f"Here are your current vitals, {first}:\n\n"
            "I've recorded everything from today's readings. "
            "Your care team can see these in real-time. "
            "Would you like me to explain what any of these numbers mean?"
        )
    if any(w in msg for w in ["med", "drug", "prescription", "pill"]):
        return (
            f"Let me review your current medications, {first}:\n\n"
            "All medications are on schedule. Remember — never adjust doses without talking to your provider first. "
            "Would you like me to explain what each one does?"
        )
    if any(w in msg for w in ["lab", "test", "result", "bnp", "a1c", "glucose"]):
        return (
            f"Let me pull up your latest lab results, {first}:\n\n"
            "I'll highlight anything that needs attention and explain what it means in simple terms. "
            "Would you like the detailed breakdown?"
        )
    if any(w in msg for w in ["goal", "target", "progress"]):
        return (
            f"Here's how you're doing on your care goals, {first}:\n\n"
            "I track these daily to help you stay on course. "
            "Small consistent steps make a big difference over time!"
        )

    return (
        f"Hi {first}! I can help with:\n\n"
        "- **Check your vitals** and explain what they mean\n"
        "- **Review medications** and schedules\n"
        "- **Analyze lab results** and flag concerns\n"
        "- **Track care goals** and progress\n"
        "- **Send updates** to your care team\n"
        "- **Explain conditions** in plain language\n\n"
        "What would you like to know?"
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
