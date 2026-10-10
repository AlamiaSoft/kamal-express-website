# 🚀 Proposal & Plan: Dynamic Agent Configuration & Service Catalog System

## 📌 Executive Summary

Recently, **Kamal Express** entered into an official agreement with a **China Study Services Provider**, adding **China Study Visas & University Admissions** to the service portfolio.

During a real-life test (`testing/ai-interaction.md`), when a client asked:
> *"need help on study visa for china"*

The agent responded with:
> *"We provide full-service admissions & visa assistance for Europe (Greece, Hungary, Italy, Germany), UK, Australia, and Canada."*

Because destination catalogs and system prompts were hardcoded in code files (`prompts.py`, `index.php`, `index.ts`), the AI assistant failed to guide the user on **China Study Visas**.

---

## 🎯 Objectives

1. **Add Immediate Support for China Study Visas**:
   - Include China JW201/JW202 form processing, CSC / Provincial / University scholarships, MBBS & Engineering admissions, MOFA attestation, and X1/X2 visa guidance.
2. **Build a Dynamic Agent Configuration Engine**:
   - Allow staff/admins to configure system prompts, available destinations, active services, and agent behavior dynamically without touching code or redeploying containers.

---

## 📐 System Architecture: Dynamic Prompt & Service Catalog

```mermaid
flowchart TD
    Admin([👤 Admin / Manager]) <-->|Edit Prompts & Catalog| AdminUI[💻 Admin CRM Panel (/admin/agent-config)]
    AdminUI <-->|Save JSON / Database| ConfigDB[(🗄️ Agent Configs & Services Catalog)]
    
    ConfigDB -->|Dynamic Fetch| PHPAPI[⚡ PHP Slim API /api/chat]
    ConfigDB -->|Dynamic Sync| CFWorker[⚡ Cloudflare Worker ai-support]
    ConfigDB -->|Dynamic Load| PythonAgents[🧠 KamalExpress-Agents Platform]

    PHPAPI <--> User1([👤 Public Website Visitor])
    CFWorker <--> User1
    PythonAgents <--> Staff([👤 Internal Staff])
```

---

## 🛠️ Step-by-Step Implementation Plan

### Phase 1: Immediate Support for China Study Visas
Update current agent knowledge bases across `kamal-express-website` and `KamalExpress-Agents` with China Study Visa details:
- **Destinations Covered**: China (New!), Greece, UK, Europe (Hungary, Italy, Germany), Australia, Canada, UAE, Saudi Arabia.
- **China Specific Guidance**:
  - **Visa Types**: X1 Visa (Study > 180 days), X2 Visa (Short term < 180 days).
  - **Key Documents**: JW201 / JW202 Visa Application Form issued by Chinese Ministry of Education, University Admission Notice, Physical Examination Record, Police Clearance Certificate (PCC) attested by MOFA & Chinese Embassy.
  - **Scholarships**: Chinese Government Scholarship (CSC), Provincial Government Scholarships, Belt & Road Scholarships for MBBS, Computer Science, and Engineering programs.

### Phase 2: Centralized Config Schema (`config/agent_services.json`)
Create a single structured configuration file loadable by PHP, Node/Worker, and Python:

```json
{
  "agent_name": "Kamal Express AI Assistant",
  "system_prompt_template": "You are the official AI Support Assistant for Kamal Express...",
  "active_services": {
    "visas": true,
    "study_visas": true,
    "umrah": true,
    "tickets": true,
    "hotels": true
  },
  "study_visa_destinations": [
    {
      "country": "China",
      "flag": "🇨🇳",
      "popular_programs": ["MBBS", "Computer Science & AI", "Civil Engineering", "Chinese Language"],
      "scholarships": ["CSC Scholarship", "Provincial Scholarship", "Silk Road Scholarship"],
      "documents": ["JW201 / JW202 Form", "Admission Notice", "PCC Attested by MOFA & Chinese Embassy", "Foreigner Physical Exam"],
      "visa_types": ["X1 (Long-term)", "X2 (Short-term)"]
    },
    {
      "country": "Greece & Europe",
      "flag": "🇪🇺",
      "popular_programs": ["Business Administration", "Tourism & Hospitality", "Maritime Studies"]
    },
    { "country": "UK", "flag": "🇬🇧" },
    { "country": "Australia", "flag": "🇦🇺" },
    { "country": "Canada", "flag": "🇨🇦" }
  ]
}
```

### Phase 3: Admin CRM Control Panel (`/admin/agent-config`)
Build an interactive configuration tab in `frontend/src/components/AdminView.tsx`:
- ➕ **Add New Destination / Service**: Add countries (e.g. China, Turkey, Malaysia) with 1 click.
- ✏️ **Edit System Prompts**: Adjust tone, instructions, and escalation rules.
- 🔘 **Toggle Services**: Turn specific visa types or seasonal packages ON/OFF instantly.
- 🧪 **Live Preview Sandbox**: Test prompt changes directly in the CRM before publishing live.

### Phase 4: Sync to `KamalExpress-Agents`
Update `agents/visa/prompts.py` and `agents/orchestrator/graph.py` in `E:\Alamia\KamalExpress-Agents` to pull prompts dynamically from the central JSON config or database API.

---

## ❓ Alignment Questions for User

1. **China Study Details**: Do you have specific partner universities or fees in China (e.g. tuition-free scholarships, monthly stipends, MBBS packages) that you would like hardcoded into the initial knowledge base?
2. **Admin Permissions**: Should prompt and service configuration in the Admin CRM be restricted to `Admin` role only, or accessible to `Staff` as well?
3. **Execution**: Shall we proceed now with applying **Phase 1 (China Study Visa support)** and **Phase 2 (Central JSON Config Schema)**?
