from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# Allow all origins for development (replace with a more specific list for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development purposes, be specific in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

direct_line_secret = '9sfJsjrgx3ayikfYKFqFaGYaqjEtyqYtBdnOdGkfuWz40z8AyFr2JQQJ99BBACi5YpzAArohAAABAZBSfeFj.FK1JY0ayJdIEGBBLdZiu8xcgdXtk9g8D7E7caXZO3uUzV23kjdE4JQQJ99BBACi5YpzAArohAAABAZBS1fYC'  # Replace with your Direct Line Secret

@app.get("/token")
async def get_token():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://directline.botframework.com/v3/directline/tokens/generate',
            headers={
                'Authorization': f'Bearer {direct_line_secret}',
                'Content-Type': 'application/json'
            }
        )
        if response.status_code == 200:
            return response.json()  # Send the token as JSON
        else:
            return {"error": "Failed to generate token", "status_code": response.status_code}
