import os
import json 
from dotenv import load_dotenv
import faiss
from sentence_transformers import SentenceTransformer
import langchain
from langchain.prompts import PromptTemplate
from langchain_groq import ChatGroq
import pickle

load_dotenv()

llm = ChatGroq(
    model_name="llama-3.1-8b-instant",
    groq_api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.4,
)

embedding_model= SentenceTransformer('all-MiniLM-L6-v2')
embedding_dim= 384

index = faiss.IndexFlatL2(embedding_dim)
document = []
metadata =[]

def load_knowledge_base(data_file='data.txt', index_file='faiss_index.idx', meta_file='metadata.pkl'):
    global index, documents, metadata

    def create_new_index():
        global index, documents, metadata
        print("Creating a new FAISS index from data...")

        try:
            with open(data_file, 'r') as f:
                data = json.load(f)

            documents = [item['text'] for item in data.get('documents', [])]
            metadata = data.get('documents', [])

            if not documents:
                print("No documents found in data file.")
                return

            embeddings = embedding_model.encode(documents)
            index = faiss.IndexFlatL2(embedding_dim)
            index.add(embeddings)

            # Save index and metadata
            faiss.write_index(index, index_file)
            with open(meta_file, 'wb') as f:
                pickle.dump(metadata, f)

            print(f"✅ FAISS index created and saved with {len(documents)} documents.")

        except Exception as e:
            print(f"❌ Error while creating new FAISS index: {str(e)}")

    # Check if both index and metadata exist
    if os.path.exists(index_file) and os.path.exists(meta_file):
        print("📦 Loading FAISS index and metadata from disk...")
        try:
            index = faiss.read_index(index_file)

            if os.path.getsize(meta_file) == 0:
                print("⚠️ Metadata file is empty. Rebuilding index.")
                create_new_index()
                return

            with open(meta_file, 'rb') as f:
                metadata = pickle.load(f)

            documents = [item['text'] for item in metadata]
            print(f"✅ Successfully loaded {len(documents)} documents from saved index.")
        except Exception as e:
            print(f"❌ Failed to load existing index or metadata: {str(e)}")
            print("⚙️ Rebuilding index and metadata...")
            create_new_index()
    else:
        print("⚠️ Index or metadata file not found. Creating new one...")
        create_new_index()
        
def search_document(query, k=3):
    
    query_embedding = embedding_model.encode([query])
    distances, indices = index.search(query_embedding,k)
    
    results=[]
    for i in indices[0]:
        if(i>=0 and i<len(documents)):
            results.append(documents[i])
    return results

def answer_query(query):
    results = search_document(query,k=3)
    
    if not results:
        return "Sorry I couldnt find any info. Try another question or call Rustam's Mill at 9921673793"
    
    context = "\n".join(results)
    
    prompt_template= PromptTemplate(
        input_variables =['context','question'],
        template="You are a helpful assistant for Rustam's Grinding Mill. Answer using only the provided context. If you can't answer, say you don't know and suggest contacting the mill.\n\nContext:\n{context}\n\nQuestion: {question}\nAnswer:"
        
    )
    
    prompt = prompt_template.format(context=context,question= query)
    response= llm.invoke(prompt)
    
    return response.content

def main():
    load_knowledge_base()
    print("Welcome to the Rustam's Mill Chatbot! Type 'quit' to exit.")
    while True:
        query= input("\nYour Question").strip()
        if query.lower() == 'quit':
            print("Goodbye!")
            break
        if not query:
            print("Pleae enter the que:")
            continue
        answer= answer_query(query)
        print("Chatbot: ",answer)
        
if __name__ == "__main__":
    main()