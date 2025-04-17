from flask import Flask, jsonify,request
from rag_app import load_knowledge_base, answer_query

app = Flask(__name__)

load_knowledge_base()

@app.route('/',methods=['POST','GET'])
def main():
    return jsonify({"data":"Server is working!"})

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    query = data.get("query")  # Assuming your frontend sends JSON like { "query": "your question" }

    if not query:
        return jsonify({"error": "No query provided"}), 400

    ans = answer_query(query)
    return jsonify({"data": ans})

if __name__ == "__main__":
    app.run(debug=True)
    
