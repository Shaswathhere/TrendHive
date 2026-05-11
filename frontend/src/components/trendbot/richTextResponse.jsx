function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-strong-${index}`} className="font-semibold text-slate-950">
          {part.slice(2, -2)}
        </strong>
      )
    }

    return <span key={`${keyPrefix}-text-${index}`}>{part}</span>
  })
}

function parseBlocks(content) {
  const lines = content.split("\n").map((line) => line.trimEnd())
  const blocks = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()

    if (!line) {
      index += 1
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      const items = []
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ""))
        index += 1
      }
      blocks.push({ type: "ul", items })
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""))
        index += 1
      }
      blocks.push({ type: "ol", items })
      continue
    }

    if (/^#{1,3}\s+/.test(line)) {
      blocks.push({
        type: "heading",
        text: line.replace(/^#{1,3}\s+/, ""),
      })
      index += 1
      continue
    }

    if (/^[A-Z][A-Z0-9\s/&:-]{3,}$/.test(line)) {
      blocks.push({
        type: "heading",
        text: line,
      })
      index += 1
      continue
    }

    const paragraphLines = [line]
    index += 1

    while (index < lines.length) {
      const nextLine = lines[index].trim()
      if (!nextLine || /^[-*]\s+/.test(nextLine) || /^\d+\.\s+/.test(nextLine) || /^#{1,3}\s+/.test(nextLine)) {
        break
      }
      paragraphLines.push(nextLine)
      index += 1
    }

    blocks.push({
      type: "p",
      text: paragraphLines.join(" "),
    })
  }

  return blocks
}

export function RichTextResponse({ content }) {
  const blocks = parseBlocks(content)

  return (
    <div className="space-y-4 leading-7 text-slate-700">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={`heading-${index}`} className="text-base font-semibold tracking-tight text-slate-950">
              {renderInline(block.text, `heading-${index}`)}
            </h3>
          )
        }

        if (block.type === "ul") {
          return (
            <ul key={`ul-${index}`} className="space-y-2 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`ul-${index}-${itemIndex}`} className="list-disc marker:text-emerald-500">
                  {renderInline(item, `ul-${index}-${itemIndex}`)}
                </li>
              ))}
            </ul>
          )
        }

        if (block.type === "ol") {
          return (
            <ol key={`ol-${index}`} className="space-y-2 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={`ol-${index}-${itemIndex}`} className="list-decimal marker:font-semibold marker:text-slate-500">
                  {renderInline(item, `ol-${index}-${itemIndex}`)}
                </li>
              ))}
            </ol>
          )
        }

        return (
          <p key={`p-${index}`} className="text-sm sm:text-[15px]">
            {renderInline(block.text, `p-${index}`)}
          </p>
        )
      })}
    </div>
  )
}
