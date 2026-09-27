from app.core.redis import redis_client


redis_client.set("aegisflow:test", "Redis is working")

value = redis_client.get("aegisflow:test")

print(value)