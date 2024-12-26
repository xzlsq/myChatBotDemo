<script setup lang="ts">
import { ref } from 'vue'
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import type { message } from '@/types';

var chatContent = ref<message[]>([])
var question = ref<string>('')

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-f0467fd3f70d4d2eb0fbdf49d67127bc',
    dangerouslyAllowBrowser: true
});

async function main() {
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are a helpful assistant." }],
        model: "deepseek-chat",
    });

    chatContent.value.push({
        id: completion.created.toString(),
        role: completion.choices[0].message.role,
        content: completion.choices[0].message.content ?? ''
    })

}

function resizeTextarea(e: any) {
    var textarea = e.target
    // console.log(textarea.scrollHeight)
    if (textarea.scrollHeight <= 200) {
        textarea.classList.add('overflow-hidden')
        textarea.classList.remove('overflow-auto')
        textarea.style.height = 'auto'; // 先重置高度
        textarea.style.height = (textarea.scrollHeight) + 'px';
    } else {
        textarea.classList.remove('overflow-hidden')
        textarea.classList.add('overflow-auto')
    }
}

function sendQuestion(e: KeyboardEvent) {
    // 按下回车开始请求
    if (e.code == 'Enter' && !e.shiftKey) {
        e.preventDefault()
        var message: ChatCompletionMessageParam[] = [{ role: "user", content: question.value }]

        chatContent.value.push({
            id: Date.now().toString(),
            role: "user",
            content: question.value
        })

        openai.chat.completions.create({
            messages: message,
            model: "deepseek-chat",
        }).then((res) => {
            console.log(res.choices[0])
            chatContent.value.push({
                id: res.created.toString(),
                role: res.choices[0].message.role,
                content: res.choices[0].message.content ?? ''
            })
        })
        question.value = ''
    }
}

// main()

</script>

<template>
    <div name="输出框" class="w-full h-full overflow-hidden flex flex-col items-center">
        <div class="w-full h-14 flex items-center justify-center text-2xl border-b border-black">
            新的聊天
        </div>
        <div class="grow w-full px-8 pt-4 pb-2 ">
            <p v-for="content of chatContent" :key="content.id">
                {{ content.role }}: {{ content.content }}
            </p>
        </div>
        <div name="输入框" class="w-[80%] min-h-16 px-4 py-2 border border-gray-400 bottom-14 
      rounded flex justify-center items-center mb-14">
            <textarea @input="(e) => resizeTextarea(e)" v-model="question"
                class="w-full box-border h-fit resize-none outline-none overflow-hidden"
                placeholder="问一问... | 按下Shift+Enter换行 | 按下Enter发送" @keypress="(e) => sendQuestion(e)"></textarea>
        </div>
    </div>
</template>
