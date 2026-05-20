# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

Development
-----------

1. Install Node dependencies:

```bash
npm install
```

2. Ensure the backend Python dependencies are installed and `uvicorn` is available (run this in the backend folder):

```bash
python -m pip install -r ../visualcore-sentinel/backend/requirements.txt
```

3. Start both frontend and backend together from the `FRONTEND` folder:

```bash
npm run dev
```

This runs the Next.js app on port `9002` and the backend API on port `8000`.
