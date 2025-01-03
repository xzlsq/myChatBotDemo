<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { useChatStore, usePageStore } from '@/stores/ChatStore';
import { useRoute } from 'vue-router';
import { marked } from 'marked';
import { convertToHTML } from '@/parseMd';
import { resizeTextarea } from '@/hooks';

var ChatStore = useChatStore()
var PageConfig = usePageStore()
var route = useRoute()
var question = ref<string>('')
var idx = computed(() => ChatStore.conversations.findIndex(it => it.chatId == route.params.chatId))
var newChat = ref(true)
var divRef = useTemplateRef('output')

const openai = new OpenAI({
    ...ChatStore.userConfig,
    dangerouslyAllowBrowser: true
});

async function sendQuestion(e: KeyboardEvent | null, manual: boolean) {
    var textarea: any = e?.target
    if (textarea) {
        textarea.style.height = 'auto';
    }

    // 按下回车开始请求
    if (e?.code == 'Enter' && !e?.shiftKey || manual) {
        if (question.value.length == 0) {
            return
        }
        e?.preventDefault()

        ChatStore.addDialog(route.params.chatId as string, {
            id: Date.now().toString(),
            role: "user",
            content: question.value
        })

        // 根据附带历史消息数的限制值，准备需要发送给AI的上下文
        var chatContext: ChatCompletionMessageParam[] = []
        if (PageConfig.historyMessage < ChatStore.conversations[idx.value].history.length) {
            chatContext = ChatStore.conversations[idx.value].history.slice(-PageConfig.historyMessage).map((it) => {
                return { role: it.role, content: it.content } as ChatCompletionMessageParam
            })
        } else {
            chatContext = ChatStore.conversations[idx.value].history.map((it) => {
                return { role: it.role, content: it.content } as ChatCompletionMessageParam
            })
        }

        divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="user w-full space-y-2">${marked.parse(question.value)}</div>`
        // 当出现滚动条时，有新内容添加时则自动滚动到新内容处
        divRef.value!.lastElementChild!.scrollIntoView({
            block: 'end',
            behavior: 'smooth'
        })

        question.value = ''
        var resStream = await openai.chat.completions.create({
            messages: chatContext,
            stream: true,
            ...ChatStore.chatConfig,
        })

        // 创建一个class="system w-full space-y-2"的div，用于显示completions
        var completionsDiv = document.createElement('div')
        completionsDiv.classList.add('system', 'w-full', 'space-y-2')
        divRef.value!.appendChild(completionsDiv)
        var res = await convertToHTML(resStream, completionsDiv, divRef.value!)

        ChatStore.addDialog(route.params.chatId as string, {
            id: Date.now().toString(),
            role: res[0].role,
            content: res[0].content
        })

        if (newChat.value) {
            var summary = ChatStore.conversations[idx.value].history.map((it) => {
                return { role: it.role, content: it.content } as ChatCompletionMessageParam
            })
    
            summary.push({role: 'user', content: '请为本次对话起个标题。以纯文本返回'})
            openai.chat.completions.create({
                messages: summary,
                ...ChatStore.chatConfig,
            }).then((res) => {
                ChatStore.conversations[idx.value].title = res.choices[0].message.content ?? '新的对话'
            })
        }
    }
}

watch(idx, () => {
    divRef.value!.innerHTML = ''
    for (let chat of ChatStore.conversations[idx.value].history) {
        if (chat.role == 'user') {
            divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="user w-full space-y-2">${marked.parse(chat.content)}</div>`
        } else {
            divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="system w-full space-y-2">${marked.parse(chat.content)}</div>`
        }
    }
    // 判断是否是切换到还未开始交流的新对话
    if (ChatStore.conversations[idx.value].history.length == 0) {
        newChat.value = true
    } else {
        newChat.value = false
    }

})

onMounted(() => {
    divRef.value!.innerHTML = ''
    for (let chat of ChatStore.conversations[idx.value].history) {
        if (chat.role == 'user') {
            divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="user w-full space-y-2">${marked.parse(chat.content)}</div>`
        } else {
            divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="system w-full space-y-2">${marked.parse(chat.content)}</div>`
        }
    }
    // 如果是通过homeView输入框创建的对话，则组件加载成功后主动发送在homeView输入框填写的问题
    if (ChatStore.question.length > 0) {
        question.value = ChatStore.question
        sendQuestion(null, true)
        ChatStore.question = ''
    }
    // 判断是否是还未开始交流的新对话
    if (ChatStore.conversations[idx.value].history.length == 0) {
        newChat.value = true
    } else {
        newChat.value = false
    }
})

</script>

<template>
    <div name="输出框" class="w-full h-full overflow-hidden flex flex-col items-center">
        <div class="w-full h-14 shrink-0 flex items-center justify-center text-2xl border-b border-black">
            <div class="max-w-[200px] truncate">
                {{ ChatStore.conversations[idx].title }}
            </div>
        </div>
        <div ref="output" class="grow w-full px-8 pt-4 pb-2 overflow-auto space-y-4">

        </div>
        <div name="输入框" class="w-[80%] min-h-16 px-4 my-2 border shrink-0 border-gray-400 bottom-14 
      rounded flex justify-center items-center mb-14">
            <textarea @input="(e) => resizeTextarea(e)" v-model="question"
                class="w-full box-border h-fit resize-none outline-none overflow-hidden"
                placeholder="问一问... | 按下Shift+Enter换行 | 按下Enter发送" @keypress="(e) => sendQuestion(e, false)"></textarea>
        </div>
    </div>
</template>
