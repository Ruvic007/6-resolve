import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List


class Item(BaseModel):
    name: str

class Items(BaseModel):
    items: List[Item]

app = FastAPI(debug=True)


origins = [
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory_db = {"items": []}

@app.get("/items", response_model=Items)
def get_items():
    return Items(items=memory_db["items"])

@app.post("/items", response_model=Item)
def add_item(item: Item):
    memory_db["items"].append(item)
    return item

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
