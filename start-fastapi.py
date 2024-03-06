#!/usr/bin/env python3

from typing import Union

import uvicorn
from typing import Annotated
from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse
from pathlib import Path

app = FastAPI()

@app.get("/", response_class=FileResponse)
@app.get("/index.html", response_class=FileResponse)
async def read_items():
    return Path('docs', 'index.html')

@app.get("/{directory}/{item}", response_class=FileResponse)
async def read_items(
        directory: str,
        item: str
):
    if Path('docs', directory, item).is_file():
        return Path('docs', directory, item)
    return {'error': 'cannot find path', 'path':  Path(directory, item)}


if __name__ == "__main__":
    # uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
    uvicorn.run("start-fastapi:app", host="127.0.0.1", port=8000, reload=True)
