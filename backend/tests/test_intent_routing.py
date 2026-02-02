import types
import os
from backend import graph

# Ensure job_logs folder for test user is clean
TEST_UID = "tester@example.com"
user_folder = os.path.join(graph.JOBS_DIR, graph._sanitize_userid(TEST_UID))
if not os.path.exists(user_folder):
    os.makedirs(user_folder, exist_ok=True)


def make_state(user_command):
    return {"user_command": user_command, "user_profile": {"email": TEST_UID}}


def test_show_applied_intent(monkeypatch):
    # Mock the LLM to return SHOW_APPLIED
    monkeypatch.setattr(graph, "model", types.SimpleNamespace(invoke=lambda prompt: types.SimpleNamespace(content="SHOW_APPLIED")))
    state = make_state("what did I apply to recently?")
    res = graph.intent_routing_node(state)
    assert res.get("listed_kind") == "applied"
    assert isinstance(res.get("listed_items"), list)


def test_apply_pending_intent(monkeypatch):
    monkeypatch.setattr(graph, "model", types.SimpleNamespace(invoke=lambda prompt: types.SimpleNamespace(content="APPLY_PENDING")))
    state = make_state("please start applying to my pending jobs")
    res = graph.intent_routing_node(state)
    assert res.get("is_active") is True
    assert res.get("current_mode") == "process_pending"


def test_chat_intent(monkeypatch):
    # Return CHAT and ensure a reply is generated
    def fake_invoke(prompt):
        # For the classifier call return CHAT
        if isinstance(prompt, str) and "Classify the user's input" in prompt:
            return types.SimpleNamespace(content="CHAT")
        # For the reply generation return a message
        return types.SimpleNamespace(content="Hello! I can help with your job search.")

    monkeypatch.setattr(graph, "model", types.SimpleNamespace(invoke=fake_invoke))
    state = make_state("Hi there — any tips for my resume?")
    res = graph.intent_routing_node(state)
    assert res.get("is_active") is False
    msgs = res.get("messages")
    assert msgs and msgs[0]["role"] == "assistant"
    assert isinstance(msgs[0]["content"], str)


def test_greeting_is_chat(monkeypatch):
    # Greeting-only input should be treated as CHAT (short salutations)
    def fake_invoke(prompt):
        # If asked to generate a chat reply, return a friendly message
        if isinstance(prompt, str) and ("The user said:" in prompt or "Respond as a helpful job assistant" in prompt):
            return types.SimpleNamespace(content="Hello there! How can I help you today?")
        # Should not be called for classifier in this case, but if it is, safe fallback
        return types.SimpleNamespace(content="CHAT")

    monkeypatch.setattr(graph, "model", types.SimpleNamespace(invoke=fake_invoke))
    state = make_state("Hi")
    res = graph.intent_routing_node(state)
    assert res.get("is_active") is False
    msgs = res.get("messages")
    assert msgs and msgs[0]["role"] == "assistant"
    assert isinstance(msgs[0]["content"], str)
