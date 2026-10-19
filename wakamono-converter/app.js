(function () {
  const $ = (id) => document.getElementById(id);
  const input = $("in"), out = $("out"), note = $("note"), actions = $("actions"), label = $("label");
  let variant = 0;
  let last = "";

  function render() {
    const text = input.value.trim();
    if (!text) {
      out.textContent = "言葉を入力してね";
      note.textContent = "";
      actions.hidden = true;
      return;
    }
    const r = Slang.convert(text, variant);
    out.textContent = "";
    for (const p of r.parts) {
      if (p.hit) {
        const m = document.createElement("mark");
        m.textContent = p.t;
        out.appendChild(m);
      } else {
        out.appendChild(document.createTextNode(p.t));
      }
    }
    last = Slang.toText(r);
    label.textContent = `変換結果（パターン ${variant + 1}/3）`;
    note.textContent = r.fallback
      ? "辞書にない言葉なので、簡易テンプレートで装飾しました。"
      : `${r.hits}か所を変換しました（緑色の部分）。`;
    actions.hidden = false;
  }

  $("go").addEventListener("click", () => { variant = 0; render(); });
  $("again").addEventListener("click", () => { variant = (variant + 1) % 3; render(); });
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") { variant = 0; render(); } });
  document.querySelectorAll(".chip").forEach((c) =>
    c.addEventListener("click", () => { input.value = c.textContent; variant = 0; render(); }));
  $("copy").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(last);
      $("copy").textContent = "コピーしました";
    } catch {
      $("copy").textContent = "コピーできませんでした";
    }
    setTimeout(() => { $("copy").textContent = "コピー"; }, 1500);
  });
})();
