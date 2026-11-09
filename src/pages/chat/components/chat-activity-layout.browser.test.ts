import { nothing, render } from "lit";
import { afterEach, describe, expect, it } from "vitest";
import "../../../styles.css";
import "../../../styles/chat.ts";
import type { MessageGroup } from "../../../lib/chat/chat-types.ts";
import { renderActivityGroup, renderMessageGroup } from "./chat-message-group.test-support.ts";
import { settleToolBridges } from "./chat-tool-render.test-support.ts";

let container: HTMLDivElement | undefined;
afterEach(() => {
  if (container) {
    render(nothing, container);
    container.remove();
    container = undefined;
  }
});

function messageGroup(key: string, role: string, messages: unknown[]): MessageGroup {
  return {
    kind: "group",
    key,
    role,
    timestamp: 1000,
    isStreaming: false,
    visibleContent: "non-text",
    messages: messages.map((message, index) => ({
      key: key + index,
      message,
      hasVisibleContent: true,
    })),
  };
}

function activityFixture(note = "") {
  const runId = "activity-layout";
  const messages: unknown[] = Array.from({ length: 4 }, (_, index) => ({
    role: "assistant",
    content: [
      {
        type: "toolCall",
        id: "batch-" + index,
        name: "exec",
        runId,
        arguments: { title: "Batch " + (index + 1), code: "// Read project files" },
      },
    ],
    timestamp: 1000,
  }));
  for (let index = 0; index < 40; index++) {
    const id = "child-" + index;
    messages.push({
      role: "custom",
      content: [
        {
          type: "toolCall",
          id,
          name: "read",
          runId,
          parentToolCallId: "batch-" + Math.floor(index / 10),
          arguments: { path: "/workspace/source-" + index + ".ts" },
        },
        {
          type: "toolResult",
          toolCallId: id,
          toolName: "read",
          content: [{ type: "text", text: "Source contents" }],
        },
        ...(index === 0 && note ? [{ type: "text", text: note }] : []),
      ],
      timestamp: 1000 + index,
    });
  }
  return messageGroup("activity", "tool", messages);
}

describe.runIf("__vitest_browser__" in globalThis)("activity group sizing", () => {
  it.each(["standalone", "inline"] as const)(
    "fits visible rows, caps expanded content, and shrinks after collapse (%s)",
    async (presentation) => {
      container = document.body.appendChild(document.createElement("div"));
      container.style.width = "760px";
      const group = activityFixture();
      const expanded = new Set<string>();
      const opts = {
        showReasoning: false,
        isToolMessageExpanded: () => true,
        isToolExpanded: (id: string) => expanded.has(id),
        onToggleToolExpanded: (id: string) => {
          if (expanded.has(id)) {
            expanded.delete(id);
          } else {
            expanded.add(id);
          }
          draw();
        },
      };
      const draw = () => {
        const activity = renderActivityGroup(
          [group],
          opts,
          presentation === "inline" ? "continuation" : "standalone",
        );
        render(
          presentation === "inline"
            ? renderMessageGroup(
                messageGroup("frame", "assistant", [{ role: "assistant", content: "Finished." }]),
                {
                  ...opts,
                  frameContent: [activity],
                },
              )
            : activity,
          container!,
        );
      };
      draw();
      await settleToolBridges(container);
      const body = container.querySelector<HTMLElement>(".chat-activity-group__body")!;
      const compactHeight = body.getBoundingClientRect().height;
      expect(body.querySelectorAll(":scope > .chat-bubble")).toHaveLength(4);
      expect(body.querySelectorAll(".chat-tool-row")).toHaveLength(4);
      expect(body.scrollHeight).toBe(body.clientHeight);
      expect(compactHeight).toBeGreaterThan(0);
      expect(compactHeight).toBeLessThan(200);

      const toggle = () => body.querySelector<HTMLButtonElement>(".chat-tool-msg-summary")!.click();
      toggle();
      await settleToolBridges(container);
      expect(body.querySelectorAll(".chat-tool-row")).toHaveLength(14);
      expect(body.getBoundingClientRect().height).toBeCloseTo(
        Math.min(420, window.innerHeight * 0.58),
        0,
      );
      expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
      body.scrollTop = body.scrollHeight;
      expect(body.scrollTop).toBeGreaterThan(0);

      toggle();
      await settleToolBridges(container);
      expect(body.getBoundingClientRect().height).toBe(compactHeight);
      expect(body.scrollHeight).toBe(body.clientHeight);
      expect(body.scrollTop).toBe(0);
    },
  );

  it.each([760, 350])("keeps expanded tool contents above the next row at %ipx", async (width) => {
    container = document.body.appendChild(document.createElement("div"));
    container.style.width = `${width}px`;
    const group = messageGroup(
      "expanded-details",
      "tool",
      Array.from({ length: 4 }, (_, index) => ({
        role: "assistant",
        content: [
          {
            type: "toolCall",
            id: `command-${index}`,
            name: "exec",
            arguments: {
              title: `Inspect workspace ${index + 1}`,
              command: Array.from(
                { length: 18 },
                (_entry, line) =>
                  `Write-Output "Step ${index + 1}, line ${line + 1}: checking project files and agent work details"`,
              ).join("\n"),
            },
          },
        ],
        timestamp: 1000 + index,
      })),
    );
    group.isStreaming = true;
    const expanded = new Set<string>();
    const draw = () =>
      render(
        renderActivityGroup([group], {
          showReasoning: false,
          isToolMessageExpanded: () => true,
          isToolExpanded: (id: string) => expanded.has(id),
          onToggleToolExpanded: (id: string) => {
            if (expanded.has(id)) {
              expanded.delete(id);
            } else {
              expanded.add(id);
            }
            draw();
          },
        }),
        container!,
      );
    draw();
    await settleToolBridges(container);
    const body = container.querySelector<HTMLElement>(".chat-activity-group__body")!;
    const collapsedScrollHeight = body.scrollHeight;
    for (let index = 0; index < 4; index++) {
      body.querySelectorAll<HTMLButtonElement>(".chat-tool-msg-summary")[index]!.click();
      await settleToolBridges(container);
    }
    const rows = [...body.querySelectorAll<HTMLElement>(":scope > .chat-bubble")];
    expect(rows).toHaveLength(4);
    for (let index = 0; index < rows.length; index++) {
      const output = rows[index]!.querySelector<HTMLElement>(".chat-tool-msg-body")!;
      expect(output.textContent).toContain("line 18");
      expect(output.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        rows[index]!.getBoundingClientRect().bottom + 1,
      );
      if (index + 1 < rows.length) {
        expect(output.getBoundingClientRect().bottom).toBeLessThanOrEqual(
          rows[index + 1]!.getBoundingClientRect().top + 1,
        );
      }
    }
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    body.scrollTop = body.scrollHeight;
    expect(rows.at(-1)!.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      body.getBoundingClientRect().bottom + 1,
    );
    for (let index = 0; index < 4; index++) {
      body.querySelectorAll<HTMLButtonElement>(".chat-tool-msg-summary")[index]!.click();
      await settleToolBridges(container);
    }
    expect(body.scrollHeight).toBe(collapsedScrollHeight);
  });
  it("caps an opened lone step whose nested calls are all routine", async () => {
    container = document.body.appendChild(document.createElement("div"));
    container.style.width = "760px";
    const runId = "lone-step";
    const group = messageGroup("step", "tool", [
      {
        role: "assistant",
        content: [
          {
            type: "toolCall",
            id: "step",
            name: "exec",
            runId,
            arguments: { title: "Watch the build", code: "// Poll until done" },
          },
        ],
        activity: [
          {
            itemId: "tool:step",
            toolCallId: "step",
            kind: "tool",
            name: "exec",
            title: "Exec",
            phase: "end",
            status: "completed",
            commandBearing: true,
          },
        ],
        timestamp: 1000,
      },
      ...Array.from({ length: 40 }, (_, index) => ({
        role: "custom",
        content: [
          {
            type: "toolCall",
            id: "poll-" + index,
            name: "process",
            runId,
            parentToolCallId: "step",
            arguments: { action: "poll" },
          },
          {
            type: "toolResult",
            toolCallId: "poll-" + index,
            toolName: "process",
            content: [{ type: "text", text: "running" }],
          },
        ],
        activity: [],
        timestamp: 1001 + index,
      })),
    ]);
    const expanded = new Set<string>();
    const draw = () =>
      render(
        renderActivityGroup([group], {
          showReasoning: false,
          isToolExpanded: (id: string) => expanded.has(id),
          onToggleToolExpanded: (id: string) => {
            expanded.add(id);
            draw();
          },
        }),
        container!,
      );
    draw();
    await settleToolBridges(container);
    expect(container.querySelector(".chat-activity-group__summary")).toBeNull();
    const body = container.querySelector<HTMLElement>(".chat-activity-group__body")!;
    const chevronOpacity = (row: number) =>
      getComputedStyle(body.querySelectorAll(".chat-tool-row__chevron")[row]!).opacity;
    expect(body.querySelectorAll(".chat-tool-row")).toHaveLength(1);
    expect(body.scrollHeight).toBe(body.clientHeight);
    // The step's own row keeps its chevron; rows under it reveal theirs on hover.
    expect(chevronOpacity(0)).not.toBe("0");

    body.querySelector<HTMLButtonElement>(".chat-tool-msg-summary")!.click();
    await settleToolBridges(container);
    expect(body.querySelectorAll(".chat-tool-row")).toHaveLength(41);
    expect(chevronOpacity(1)).toBe("0");
    expect(body.getBoundingClientRect().height).toBeCloseTo(
      Math.min(420, window.innerHeight * 0.58),
      0,
    );
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  });

  it("preserves non-tool text beside a card moved under its parent", async () => {
    container = document.body.appendChild(document.createElement("div"));
    const note = "Keep this explanation visible.";
    render(
      renderActivityGroup([activityFixture(note)], {
        showReasoning: false,
        isToolMessageExpanded: () => true,
      }),
      container,
    );
    await settleToolBridges(container);
    expect(container.querySelectorAll(".chat-tool-row")).toHaveLength(4);
    expect(container.querySelectorAll(".chat-activity-group__body > .chat-bubble")).toHaveLength(5);
    expect(container.querySelector(".chat-text")?.textContent).toContain(note);
  });
});
