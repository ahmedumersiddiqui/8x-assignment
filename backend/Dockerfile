FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY . .

CMD alembic upgrade head \
 && python -m app.seed.run \
 && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
