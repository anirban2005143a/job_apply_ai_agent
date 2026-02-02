import types
import sys
import os
# Ensure parent folder (backend/) is importable when running this script from tests/
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Create lightweight stubs for external packages so tests can import local modules without installing deps.
import types as _types_module
import types
# langgraph stubs
_langgraph = _types_module.ModuleType('langgraph')
_langgraph.graph = _types_module.ModuleType('langgraph.graph')
_langgraph.graph.StateGraph = lambda *a, **k: None
_langgraph.graph.START = 'START'
_langgraph.graph.END = 'END'
_langgraph.checkpoint = _types_module.ModuleType('langgraph.checkpoint')
_langgraph.checkpoint.sqlite = _types_module.ModuleType('langgraph.checkpoint.sqlite')
_langgraph.checkpoint.sqlite.SqliteSaver = lambda *a, **k: None
_langgraph.types = _types_module.ModuleType('langgraph.types')
_langgraph.types.interrupt = lambda *a, **k: None
_langgraph.types.Command = object
import sys
sys.modules['langgraph'] = _langgraph
sys.modules['langgraph.graph'] = _langgraph.graph
sys.modules['langgraph.checkpoint'] = _langgraph.checkpoint
sys.modules['langgraph.checkpoint.sqlite'] = _langgraph.checkpoint.sqlite
sys.modules['langgraph.types'] = _langgraph.types

# langchain_huggingface stub
_lhf = _types_module.ModuleType('langchain_huggingface')
_lhf.ChatHuggingFace = lambda *a, **k: types.SimpleNamespace(invoke=lambda p: types.SimpleNamespace(content="CHAT"))
_lhf.HuggingFaceEndpoint = lambda *a, **k: None
sys.modules['langchain_huggingface'] = _lhf

# Now import local graph module
import graph

FAILED = False

print('Running quick intent routing checks...')

# Test 1: SHOW_APPLIED intent via model classifier
print(' - SHOW_APPLIED simulation', end='... ')
graph.model = types.SimpleNamespace(invoke=lambda prompt: types.SimpleNamespace(content='SHOW_APPLIED'))
state = {"user_command": 'what did I apply to recently?', "user_profile": {"email": 'tester@example.com'}}
res = graph.intent_routing_node(state)
if res.get('listed_kind') != 'applied':
    print('FAIL')
    FAILED = True
else:
    print('OK')

# Test 2: APPLY_PENDING simulation
print(' - APPLY_PENDING simulation', end='... ')
graph.model = types.SimpleNamespace(invoke=lambda prompt: types.SimpleNamespace(content='APPLY_PENDING'))
state = {"user_command": 'please start applying to my pending jobs', "user_profile": {"email": 'tester@example.com'}}
res = graph.intent_routing_node(state)
if not (res.get('is_active') is True and res.get('current_mode') == 'process_pending'):
    print('FAIL')
    FAILED = True
else:
    print('OK')

# Test 3: Greeting should be chat (short greeting bypasses classifier)
print(' - Greeting "Hi" handling', end='... ')
def fake_invoke_for_chat(prompt):
    # If asked to generate reply, return a friendly message
    if isinstance(prompt, str) and ("The user said:" in prompt or "Respond as a helpful job assistant" in prompt):
        return types.SimpleNamespace(content='Hello there! How can I help you today?')
    return types.SimpleNamespace(content='CHAT')

graph.model = types.SimpleNamespace(invoke=fake_invoke_for_chat)
state = {"user_command": 'Hi', "user_profile": {"email": 'tester@example.com'}}
res = graph.intent_routing_node(state)
msgs = res.get('messages')
if not (res.get('is_active') is False and msgs and msgs[0]['role'] == 'assistant'):
    print('FAIL')
    FAILED = True
else:
    print('OK')

if FAILED:
    print('\nOne or more checks failed.')
    sys.exit(1)
print('\nAll intent routing checks passed.')
