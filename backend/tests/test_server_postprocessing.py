import types
import json
from backend import server


def make_state_with_message(msg_obj):
    # Simulate the object returned by agent_executor.get_state
    return types.SimpleNamespace(next=False, values={'messages': [ {'role': 'assistant', 'content': json.dumps(msg_obj)} ], 'listed_items': []})


def test_simple_chat_overrides_zero_count(monkeypatch):
    # Replace agent_executor.get_state to return a zero-count message
    msg = {"text": "I found 0 pending jobs.", "kind": "matches", "count": 0}
    monkeypatch.setattr(server, 'agent_executor', types.SimpleNamespace(get_state=lambda config: make_state_with_message(msg), invoke=lambda *args, **kwargs: None))

    # Call the simple_chat endpoint function directly
    req = types.SimpleNamespace(user_id='tester@example.com', thread_id='t1', user_profile={'email': 'tester@example.com'}, user_response='show my pending')
    import asyncio
    resp = asyncio.run(server.simple_chat(req))

    assert resp['status'] == 'success'
    assert 'No matching jobs' in resp['message'] or 'No matches found' in resp['message'] or 'search' in resp['message']
    assert resp['listed_items'] == []
