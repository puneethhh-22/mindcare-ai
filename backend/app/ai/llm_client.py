"""
Unified LLM client supporting OpenAI and Google Gemini.
Abstracts provider selection behind a single interface.
"""
import logging
from typing import AsyncGenerator, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class LLMClient:
    """Unified async LLM client."""

    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self._openai_client = None
        self._gemini_model = None

    def _get_openai(self):
        if self._openai_client is None:
            from openai import AsyncOpenAI
            self._openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self._openai_client

    def _get_gemini(self):
        if self._gemini_model is None:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._gemini_model = genai.GenerativeModel(settings.GEMINI_MODEL)
        return self._gemini_model

    async def chat(
        self,
        messages: list[dict],
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> str:
        """Send a chat completion request and return the response text."""
        try:
            if self.provider == "openai":
                return await self._openai_chat(messages, temperature, max_tokens)
            elif self.provider == "gemini":
                return await self._gemini_chat(messages, temperature, max_tokens)
            else:
                raise ValueError(f"Unknown AI provider: {self.provider}")
        except Exception as e:
            logger.error("LLM error: %s", e)
            return self._fallback_response()

    async def _openai_chat(
        self, messages: list[dict], temperature: float, max_tokens: int
    ) -> str:
        client = self._get_openai()
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""

    async def _gemini_chat(
        self, messages: list[dict], temperature: float, max_tokens: int
    ) -> str:
        model = self._get_gemini()
        # Convert OpenAI-style messages to Gemini format
        prompt = "\n".join(
            f"{m['role'].upper()}: {m['content']}"
            for m in messages
            if m["role"] != "system"
        )
        system_msg = next(
            (m["content"] for m in messages if m["role"] == "system"), ""
        )
        full_prompt = f"{system_msg}\n\n{prompt}\nASSISTANT:"

        response = await model.generate_content_async(
            full_prompt,
            generation_config={
                "temperature": temperature,
                "max_output_tokens": max_tokens,
            },
        )
        return response.text

    def _fallback_response(self) -> str:
        return (
            "I'm having trouble connecting right now. "
            "Please try again in a moment. If you're in crisis, "
            "please call 988 (Suicide & Crisis Lifeline) immediately."
        )


# Singleton instance
llm_client = LLMClient()
