import streamlit as st
from rag_app import load_knowledge_base, answer_query

# 📘 Load Knowledge Base once
@st.cache_resource
def initialize_knowledge():
    load_knowledge_base()

initialize_knowledge()

# 🧠 App Title
st.title("🔍 Chat with Knowledge Base")

# 💬 Input from user
query = st.text_input("Ask something:")

# 🚀 Process Query
if st.button("Get Answer"):
    if query.strip() == "":
        st.warning("Please enter a valid question.")
    else:
        with st.spinner("Thinking... 🤔"):
            response = answer_query(query)
        st.success("Answer:")
        st.write(response)


