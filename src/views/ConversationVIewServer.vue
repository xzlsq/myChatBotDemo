<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useChatStore, usePageStore } from '@/stores/ChatStore';
import { useRoute } from 'vue-router';
import { marked } from 'marked';
import { convertToHTML4 } from '@/parseMd';
import { resizeTextarea } from '@/hooks';
import router from '@/router';

var ChatStore = useChatStore()
var PageConfig = usePageStore()
var route = useRoute()
var question = ref<string>('')
// 当前对话的聊天记录
var currentChat = computed(() => ChatStore.conversations.find(it => it.chatId == route.params.chatId))
var newChat = ref(true)
var divRef = useTemplateRef('output')


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

        const id = route.params.chatId

        // 保存用户的问题到聊天记录中
        ChatStore.addDialog(route.params.chatId as string, {
            id: Date.now().toString(),
            role: "user",
            content: question.value
        })
        
        divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="user w-full space-y-2">${question.value}</div>`
        // 当出现滚动条时，有新内容添加时则自动滚动到新内容处
        divRef.value!.lastElementChild!.scrollIntoView({
            block: 'end',
            behavior: 'smooth'
        })
        
        try {
            const input = question.value
            question.value = ''
            // 将用户的问题发送给后端
            const resStream = await fetch('/normal', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question: input,
                    chatId: id,
                    searchOn: PageConfig.searchOn,
                    thinkOn: PageConfig.thinkOn,
                })
            })
            
            // 创建一个class="system w-full space-y-2"的div，用于显示completions
            var completionsDiv = document.createElement('div')
            completionsDiv.classList.add('system', 'w-full', 'space-y-2')
            divRef.value!.appendChild(completionsDiv)
            // 将收到的结果转换为HTML显示
            var res = await convertToHTML4(resStream, completionsDiv, divRef.value!)

            // 保存AI的回复到聊天记录中
            ChatStore.addDialog(route.params.chatId as string, {
                id: Date.now().toString(),
                role: res[0].role,
                content: res[0].content
            })

            // 如果是首次对话则请求本次对话的聊天标题
            if (newChat.value) {
                fetch('/getTitle', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        chatId: id,
                    })
                }).then((data) => {
                    return data.text()
                }).then((data) => {
                    var title = data ?? '新的对话'
                    ChatStore.setTitle(route.params.chatId as string, title)
                }, (rej) => {
                    console.error(rej)
                })

                newChat.value = false
            }
        } catch (e) {
            console.error(e)
        }



    }

}

watch(() => route.params.chatId, () => {
    divRef.value!.innerHTML = ''
    if (currentChat.value) {
        for (let chat of currentChat.value.history) {
            if (chat.role == 'user') {
                divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="user w-full space-y-2">${chat.content}</div>`
            } else {
                divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="system w-full space-y-2">${marked.parse(chat.content)}</div>`
            }
        }
        // 判断是否是切换到还未开始交流的新对话
        if (currentChat.value!.history.length == 0) {
            newChat.value = true
        } else {
            newChat.value = false
        }
    } else {
        router.replace('/')
    }
})

watch(currentChat, () => {
    if (!currentChat.value) {
        router.replace('/')
    }
})

onMounted(() => {
    divRef.value!.innerHTML = ''

    if (currentChat.value) {
        for (let chat of currentChat.value.history) {
            if (chat.role == 'user') {
                divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="user w-full space-y-2">${chat.content}</div>`
            } else {
                divRef.value!.innerHTML = divRef.value!.innerHTML + `<div class="system w-full space-y-2">${marked.parse(chat.content)}</div>`
            }
        }

        // 判断是否是还未开始交流的新对话
        if (currentChat.value!.history.length == 0) {
            newChat.value = true
        } else {
            newChat.value = false
        }

        // 如果是通过homeView输入框创建的对话，则组件加载成功后主动发送在homeView输入框填写的问题
        if (ChatStore.question.length > 0) {
            question.value = ChatStore.question
            sendQuestion(null, true)
            ChatStore.question = ''
        }

    } else {
        router.replace('/')
    }
})

</script>

<template>
    <div name="输出框" class="w-full h-full overflow-hidden flex flex-col items-center">
        <div class="w-full h-14 shrink-0 flex items-center justify-center text-2xl border-b border-black">
            <div class="max-w-[200px] truncate">
                {{ currentChat?.title || '新的对话' }}
            </div>
        </div>
        <div ref="output" class="grow w-full px-8 pt-4 pb-2 overflow-auto space-y-4 flex flex-col">

        </div>
        <div name="输入框" class="w-[80%] min-h-16 px-4 my-2 py-2 border shrink-0 border-gray-400 bottom-14 
      rounded flex flex-col justify-center items-center mb-12 bg-gray-100">
            <textarea @input="(e) => resizeTextarea(e)" v-model="question"
                class="w-full box-border h-fit resize-none outline-none overflow-hidden bg-gray-100"
                placeholder="问一问... | 按下Shift+Enter换行 | 按下Enter发送" @keypress="(e) => sendQuestion(e, false)">
            </textarea>
            <div class="flex h-fit w-full gap-1">
                <button @click="PageConfig.setThinkOn" :class="{'bg-sky-200': PageConfig.thinkOn}" class="p-2 rounded-full bg-white border !text-sm">💡深度思考</button>
                <button @click="PageConfig.setSearchOn" :class="{'bg-sky-200': PageConfig.searchOn}" class="p-2 rounded-full bg-white border !text-sm">🌐联网搜索</button>
            </div>
        </div>
    </div>
</template>
