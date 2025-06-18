<template>
  <div class="code-editor">
    <h2 class="editor-title">Try It Yourself</h2>
    <div class="button-row">
      <button @click="goBack" class="back-button">← Back</button>
      <button @click="resetCode" class="reset-button">Reset</button>
    </div>
    <div class="editor-container">
      <div class="editor-pane">
        <textarea ref="editor"></textarea>
      </div>
      <div class="preview-pane">
        <iframe ref="preview" class="preview-frame"></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/monokai.css";
import "codemirror/mode/htmlmixed/htmlmixed.js";

export default {
  name: "CodeEditor",
  data() {
    return {
      originalCode: "",
    };
  },
  mounted() {
    const code = decodeURIComponent(this.$route.query.code || "");
    this.originalCode = code;

    this.editor = CodeMirror.fromTextArea(this.$refs.editor, {
      mode: "htmlmixed",
      lineNumbers: true,
      theme: "monokai",
    });

    this.editor.setValue(code);
    this.updatePreview(code);

    this.editor.on("change", () => {
      const updatedCode = this.editor.getValue();
      this.updatePreview(updatedCode);
    });
  },
  methods: {
    updatePreview(code) {
      this.$refs.preview.srcdoc = code;
    },
    resetCode() {
      this.editor.setValue(this.originalCode);
      this.updatePreview(this.originalCode);
    },
    goBack() {
      this.$router.back();
    },
  },
};
</script>

<style scoped>
.code-editor {
  padding: 2rem;
  background-color: #1e1e1e;
  color: #f3f4f6;
  font-family: "Segoe UI", sans-serif;
  min-height: 100vh;
}

.editor-title {
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
  color: #ffffff;
  text-align: center;
}

.button-row {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.back-button,
.reset-button {
  padding: 0.5rem 1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.back-button {
  background-color: #60a5fa; /* blue-400 */
  color: white;
}

.back-button:hover {
  background-color: #3b82f6; /* blue-500 */
}

.reset-button {
  background-color: #f87171; /* red-400 */
  color: white;
}

.reset-button:hover {
  background-color: #ef4444; /* red-500 */
}

.editor-container {
  display: flex;
  gap: 1.5rem;
  border-radius: 10px;
  overflow: hidden;
  background-color: #2d2d2d;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.editor-pane,
.preview-pane {
  flex: 1;
  height: 600px;
  overflow: hidden;
}

.CodeMirror {
  height: 100%;
  font-size: 14px;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  background-color: #ffffff;
}
</style>
