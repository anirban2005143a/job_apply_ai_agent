import types
import os
import json
import backend.graph as graph


def test_sourcing_node_empty(monkeypatch):
    # Mock fetch_jobs_with_retry to return an empty list
    monkeypatch.setattr(graph, "fetch_jobs_with_retry", lambda email: [])
    state = {"user_profile": {"email": "tester@example.com"}, "messages": []}

    res = graph.sourcing_node(state)
    assert res.get("listed_kind") == "matches"
    listed = res.get("listed_items") or []
    assert isinstance(listed, list) and len(listed) == 0

    messages = res.get("messages") or []
    assert messages and len(messages) > 0
    content = getattr(messages[0], 'content', messages[0])
    # content is JSON string of message_obj
    parsed = json.loads(content)
    assert parsed.get("count") == 0
    assert "No matching jobs" in parsed.get("text")
