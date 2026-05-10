from http.server import BaseHTTPRequestHandler
import json
import traceback


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            from app.main import app
            data = {
                "status": "import_ok",
                "message": "app.main imported successfully"
            }
        except Exception as e:
            data = {
                "status": "import_failed",
                "error": str(e),
                "traceback": traceback.format_exc()
            }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data, default=str).encode("utf-8"))