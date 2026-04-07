<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

const model = defineModel<string>({ default: '' })

const props = defineProps<{
  placeholder?: string
}>()

const editor = useEditor({
  content: model.value,
  editorProps: {
    attributes: {
      class: 'post-richtext min-h-[400px] focus:outline-none',
    },
  },
  extensions: [
    StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
    Underline,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    Image.configure({
      allowBase64: false,
      resize: {
        enabled: true,
        minWidth: 48,
        minHeight: 48,
        alwaysPreserveAspectRatio: true,
      },
    }),
    Subscript,
    Superscript,
    CharacterCount,
    Placeholder.configure({ placeholder: props.placeholder ?? 'Write something...' }),
    Table.configure({ resizable: true }),
    TableRow,
    TableCell,
    TableHeader,
  ],
  onUpdate({ editor }) {
    model.value = editor.getHTML()
  },
})

watch(
  () => model.value,
  (val) => {
    if (editor.value && val !== editor.value.getHTML()) {
      editor.value.commands.setContent(val)
    }
  },
)

onBeforeUnmount(() => editor.value?.destroy())

/* ── helpers ─────────────────────────────────────── */
const { t } = useI18n()
const toast = useToast()
const colorInput = ref<HTMLInputElement | null>(null)
const imageUrlInput = ref('')
const showImageDialog = ref(false)
const imageFileInput = ref<HTMLInputElement | null>(null)
const imageUploading = ref(false)

watch(showImageDialog, (open) => {
  if (open) imageUrlInput.value = ''
})
const linkInput = ref('')
const showLinkDialog = ref(false)

function setLink() {
  if (!linkInput.value) {
    editor.value?.chain().focus().unsetLink().run()
  } else {
    editor.value?.chain().focus().setLink({ href: linkInput.value }).run()
  }
  showLinkDialog.value = false
  linkInput.value = ''
}

function openLinkDialog() {
  linkInput.value = editor.value?.getAttributes('link').href ?? ''
  showLinkDialog.value = true
}

function insertImage() {
  const src = imageUrlInput.value.trim()
  if (!src) return
  editor.value?.chain().focus().setImage({ src }).run()
  showImageDialog.value = false
  imageUrlInput.value = ''
}

async function onImageFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  imageUploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('kind', 'post')
    const res = await $fetch<{ url: string }>('/api/upload/blob', {
      method: 'POST',
      body: fd
    })
    editor.value?.chain().focus().setImage({ src: res.url }).run()
    toast.add({ title: t('settings.uploadOk'), color: 'success' })
    showImageDialog.value = false
    imageUrlInput.value = ''
  } catch (err: any) {
    const statusMsg = err?.data?.statusMessage
    const msg = typeof statusMsg === 'string' ? statusMsg : (err?.message || t('common.error'))
    toast.add({ title: msg, color: 'error' })
  } finally {
    imageUploading.value = false
  }
}

function setColor(e: Event) {
  const hex = (e.target as HTMLInputElement).value
  editor.value?.chain().focus().setColor(hex).run()
}

function insertTable() {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

const charCount = computed(() => editor.value?.storage.characterCount.characters() ?? 0)
const wordCount = computed(() => editor.value?.storage.characterCount.words() ?? 0)
</script>

<template>
  <div class="w-full border border-default rounded-xl flex flex-col bg-background">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-default bg-elevated/60 px-2 py-1.5">
      <!-- History -->
      <UFieldGroup size="xs">
        <UButton icon="i-lucide-undo-2" variant="ghost" color="neutral" :disabled="!editor?.can().undo()" @click="editor?.chain().focus().undo().run()" :title="t('editor.undo')" />
        <UButton icon="i-lucide-redo-2" variant="ghost" color="neutral" :disabled="!editor?.can().redo()" @click="editor?.chain().focus().redo().run()" :title="t('editor.redo')" />
      </UFieldGroup>

      <USeparator orientation="vertical" class="mx-1 h-5" />

      <!-- Headings -->
      <USelect
        size="xs"
        class="w-28"
        :model-value="
          editor?.isActive('heading', { level: 1 }) ? 'h1'
          : editor?.isActive('heading', { level: 2 }) ? 'h2'
          : editor?.isActive('heading', { level: 3 }) ? 'h3'
          : editor?.isActive('heading', { level: 4 }) ? 'h4'
          : 'p'
        "
        :items="[
          { label: t('editor.paragraph'), value: 'p' },
          { label: 'Heading 1', value: 'h1' },
          { label: 'Heading 2', value: 'h2' },
          { label: 'Heading 3', value: 'h3' },
          { label: 'Heading 4', value: 'h4' },
        ]"
        @update:model-value="(v: string) => {
          if (v === 'p') editor?.chain().focus().setParagraph().run()
          else editor?.chain().focus().setHeading({ level: Number(v[1]) as 1|2|3|4 }).run()
        }"
      />

      <USeparator orientation="vertical" class="mx-1 h-5" />

      <!-- Inline format -->
      <UFieldGroup size="xs">
        <UButton icon="i-lucide-bold" variant="ghost" :color="editor?.isActive('bold') ? 'primary' : 'neutral'" @click="editor?.chain().focus().toggleBold().run()" :title="t('editor.bold')" />
        <UButton icon="i-lucide-italic" variant="ghost" :color="editor?.isActive('italic') ? 'primary' : 'neutral'" @click="editor?.chain().focus().toggleItalic().run()" :title="t('editor.italic')" />
        <UButton icon="i-lucide-underline" variant="ghost" :color="editor?.isActive('underline') ? 'primary' : 'neutral'" @click="editor?.chain().focus().toggleUnderline().run()" :title="t('editor.underline')" />
        <UButton icon="i-lucide-strikethrough" variant="ghost" :color="editor?.isActive('strike') ? 'primary' : 'neutral'" @click="editor?.chain().focus().toggleStrike().run()" :title="t('editor.strike')" />
        <UButton icon="i-lucide-subscript" variant="ghost" :color="editor?.isActive('subscript') ? 'primary' : 'neutral'" @click="editor?.chain().focus().toggleSubscript().run()" :title="t('editor.subscript')" />
        <UButton icon="i-lucide-superscript" variant="ghost" :color="editor?.isActive('superscript') ? 'primary' : 'neutral'" @click="editor?.chain().focus().toggleSuperscript().run()" :title="t('editor.superscript')" />
      </UFieldGroup>

      <USeparator orientation="vertical" class="mx-1 h-5" />

      <!-- Color + Highlight -->
      <div class="flex items-center gap-0.5">
        <UTooltip :text="t('editor.textColor')">
          <button
            class="relative flex h-7 w-7 items-center justify-center rounded-md hover:bg-elevated transition-colors"
            @click="colorInput?.click()"
          >
            <UIcon name="i-lucide-palette" class="size-4" />
            <input
              ref="colorInput"
              type="color"
              class="absolute inset-0 opacity-0 cursor-pointer"
              @change="setColor"
            />
          </button>
        </UTooltip>
        <UButton
          icon="i-lucide-highlighter"
          size="xs"
          variant="ghost"
          :color="editor?.isActive('highlight') ? 'primary' : 'neutral'"
          @click="editor?.chain().focus().toggleHighlight().run()"
          :title="t('editor.highlight')"
        />
      </div>

      <USeparator orientation="vertical" class="mx-1 h-5" />

      <!-- Text align -->
      <UFieldGroup size="xs">
        <UButton icon="i-lucide-align-left" variant="ghost" :color="editor?.isActive({ textAlign: 'left' }) ? 'primary' : 'neutral'" @click="editor?.chain().focus().setTextAlign('left').run()" :title="t('editor.alignLeft')" />
        <UButton icon="i-lucide-align-center" variant="ghost" :color="editor?.isActive({ textAlign: 'center' }) ? 'primary' : 'neutral'" @click="editor?.chain().focus().setTextAlign('center').run()" :title="t('editor.alignCenter')" />
        <UButton icon="i-lucide-align-right" variant="ghost" :color="editor?.isActive({ textAlign: 'right' }) ? 'primary' : 'neutral'" @click="editor?.chain().focus().setTextAlign('right').run()" :title="t('editor.alignRight')" />
        <UButton icon="i-lucide-align-justify" variant="ghost" :color="editor?.isActive({ textAlign: 'justify' }) ? 'primary' : 'neutral'" @click="editor?.chain().focus().setTextAlign('justify').run()" :title="t('editor.alignJustify')" />
      </UFieldGroup>

      <USeparator orientation="vertical" class="mx-1 h-5" />

      <!-- Lists + block -->
      <UFieldGroup size="xs">
        <UButton icon="i-lucide-list" variant="ghost" :color="editor?.isActive('bulletList') ? 'primary' : 'neutral'" @click="editor?.chain().focus().toggleBulletList().run()" :title="t('editor.bulletList')" />
        <UButton icon="i-lucide-list-ordered" variant="ghost" :color="editor?.isActive('orderedList') ? 'primary' : 'neutral'" @click="editor?.chain().focus().toggleOrderedList().run()" :title="t('editor.orderedList')" />
        <UButton icon="i-lucide-quote" variant="ghost" :color="editor?.isActive('blockquote') ? 'primary' : 'neutral'" @click="editor?.chain().focus().toggleBlockquote().run()" :title="t('editor.blockquote')" />
        <UButton icon="i-lucide-code" variant="ghost" :color="editor?.isActive('code') ? 'primary' : 'neutral'" @click="editor?.chain().focus().toggleCode().run()" :title="t('editor.code')" />
        <UButton icon="i-lucide-code-xml" variant="ghost" :color="editor?.isActive('codeBlock') ? 'primary' : 'neutral'" @click="editor?.chain().focus().toggleCodeBlock().run()" :title="t('editor.codeBlock')" />
      </UFieldGroup>

      <USeparator orientation="vertical" class="mx-1 h-5" />

      <!-- Insert -->
      <UFieldGroup size="xs">
        <UButton icon="i-lucide-link" variant="ghost" :color="editor?.isActive('link') ? 'primary' : 'neutral'" @click="openLinkDialog" :title="t('editor.link')" />
        <UButton icon="i-lucide-image" variant="ghost" color="neutral" @click="showImageDialog = true" :title="t('editor.image')" />
        <UButton icon="i-lucide-table" variant="ghost" color="neutral" @click="insertTable" :title="t('editor.table')" />
        <UButton icon="i-lucide-minus" variant="ghost" color="neutral" @click="editor?.chain().focus().setHorizontalRule().run()" :title="t('editor.hr')" />
      </UFieldGroup>

      <!-- Table controls (only when inside table) -->
      <template v-if="editor?.isActive('table')">
        <USeparator orientation="vertical" class="mx-1 h-5" />
        <UFieldGroup size="xs">
          <UButton label="+ Col" variant="ghost" color="neutral" size="xs" @click="editor?.chain().focus().addColumnAfter().run()" />
          <UButton label="- Col" variant="ghost" color="error" size="xs" @click="editor?.chain().focus().deleteColumn().run()" />
          <UButton label="+ Row" variant="ghost" color="neutral" size="xs" @click="editor?.chain().focus().addRowAfter().run()" />
          <UButton label="- Row" variant="ghost" color="error" size="xs" @click="editor?.chain().focus().deleteRow().run()" />
          <UButton label="Del table" variant="ghost" color="error" size="xs" @click="editor?.chain().focus().deleteTable().run()" />
        </UFieldGroup>
      </template>

      <div class="ml-auto" />

      <!-- Clear -->
      <UButton
        icon="i-lucide-remove-formatting"
        size="xs"
        variant="ghost"
        color="neutral"
        @click="editor?.chain().focus().clearNodes().unsetAllMarks().run()"
        :title="t('editor.clearFormat')"
      />
    </div>

    <!-- Editor area -->
    <EditorContent
      :editor="editor"
      class="max-w-none min-h-[420px] overflow-visible px-6 py-4 text-default focus-within:outline-none [&_.tiptap]:outline-none [&_.tiptap]:min-h-[400px]"
    />

    <!-- Footer: char count -->
    <div class="flex items-center justify-end gap-3 rounded-b-xl border-t border-default bg-elevated/40 px-4 py-1.5 text-xs text-muted">
      <span>{{ charCount }} {{ t('editor.chars') }}</span>
      <span>{{ wordCount }} {{ t('editor.words') }}</span>
    </div>

    <!-- Link dialog -->
    <UModal v-model:open="showLinkDialog" :title="t('editor.link')">
      <template #body>
        <div class="flex flex-col gap-3 p-4">
          <UInput v-model="linkInput" placeholder="https://..." autofocus @keydown.enter="setLink" />
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" @click="showLinkDialog = false">{{ t('admin.cancel') }}</UButton>
            <UButton @click="setLink">{{ t('admin.save') }}</UButton>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Image dialog -->
    <UModal v-model:open="showImageDialog" :title="t('editor.image')">
      <template #body>
        <div class="flex flex-col gap-3 p-4">
          <input
            ref="imageFileInput"
            type="file"
            class="sr-only"
            accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
            :aria-label="t('settings.uploadFile')"
            :disabled="imageUploading"
            @change="onImageFileChange"
          >
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-upload"
            class="w-full sm:w-auto justify-center"
            :loading="imageUploading"
            :disabled="imageUploading"
            @click="imageFileInput?.click()"
          >
            {{ t('settings.uploadFile') }}
          </UButton>
          <p class="text-xs text-muted">
            {{ t('editor.imageDialogHint') }}
          </p>
          <USeparator />
          <UInput
            v-model="imageUrlInput"
            :placeholder="t('settings.urlPlaceholder')"
            :disabled="imageUploading"
            @keydown.enter="insertImage"
          />
          <div class="flex justify-end gap-2">
            <UButton variant="ghost" color="neutral" :disabled="imageUploading" @click="showImageDialog = false">
              {{ t('admin.cancel') }}
            </UButton>
            <UButton :disabled="imageUploading || !imageUrlInput.trim()" @click="insertImage">
              {{ t('editor.insertImage') }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<style>
/* TipTap placeholder (class `tiptap` được TipTap gắn sẵn trên ProseMirror) */
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--ui-text-muted);
  pointer-events: none;
  height: 0;
}

/*
 * TipTap ResizableNodeView: core không inject kích thước / màu cho handle — mặc định 0×0 nên không kéo được.
 * Khối [data-resize-container] bọc ảnh khi Image.configure({ resize: { enabled: true } }).
 */
.tiptap [data-resize-wrapper] {
  overflow: visible;
}

.tiptap [data-resize-handle] {
  z-index: 40;
  box-sizing: border-box;
  touch-action: none;
  background: var(--ui-primary);
  border: 2px solid var(--ui-bg);
  border-radius: 2px;
  box-shadow: 0 1px 3px color-mix(in srgb, var(--ui-text-highlighted) 25%, transparent);
}

.tiptap [data-resize-handle='top-left'],
.tiptap [data-resize-handle='top-right'],
.tiptap [data-resize-handle='bottom-left'],
.tiptap [data-resize-handle='bottom-right'] {
  width: 11px;
  height: 11px;
}

.tiptap [data-resize-handle='top-left'] {
  transform: translate(-50%, -50%);
  cursor: nwse-resize;
}

.tiptap [data-resize-handle='top-right'] {
  transform: translate(50%, -50%);
  cursor: nesw-resize;
}

.tiptap [data-resize-handle='bottom-left'] {
  transform: translate(-50%, 50%);
  cursor: nesw-resize;
}

.tiptap [data-resize-handle='bottom-right'] {
  transform: translate(50%, 50%);
  cursor: nwse-resize;
}

/* Node-select ảnh: class gắn trên dom node view (wrapper resize), không phải thẻ img */
.tiptap [data-resize-container].ProseMirror-selectednode {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
