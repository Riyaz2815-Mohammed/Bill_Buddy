try:
    from mistralai import Mistral
    print("SUCCESS: from mistralai import Mistral")
except ImportError as e:
    print("FAILED 1: ", e)

try:
    from mistralai.client import MistralClient
    print("SUCCESS: from mistralai.client import MistralClient")
except ImportError as e:
    print("FAILED 2: ", e)
    
import mistralai
print("dir(mistralai):", dir(mistralai))
