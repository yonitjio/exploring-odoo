# AI Platform support for Prompt / Chat Template

| Name                     | Templating Engine | Notes                                                               |
| ------------------------ | ----------------- | ------------------------------------------------------------------- |
| LocalAI                  | Go Text Template  | (\*\*\*\*\*)                                                        |
| vLLM                     | Jinja             | (\*\*\*)                                                            |
| Ollama                   | Go Text Template  | Only provide limited variables .System, .Prompt and .Response (???) |
| LLaMA.cpp Server Example | Jinja             | Limited to what already included in the binary (???) (\*)(\*\*)     |
| LLama.cpp Python Binding | Jinja             | Limited to what already included in the library (???) (\*)          |
| LiteLLM                  | Jinja / Python    | (???)                                                               |

(\*) Doesn't load template from external file. Adding new template need add codes

(\*\*) https://github.com/ggerganov/llama.cpp/pull/5593

(\*\*\*) https://github.com/vllm-project/vllm/pull/3237

(\*\*\*\*) https://litellm.vercel.app/docs/completion/prompt_formatting

(\*\*\*\*\*) https://localai.io/advanced/#prompt-templates

(???) Needs further research.