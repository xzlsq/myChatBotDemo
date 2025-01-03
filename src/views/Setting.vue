<script setup lang="ts">
import { useChatStore, usePageStore } from '@/stores/ChatStore';
import { useRouter } from 'vue-router';
var PageConfig = usePageStore()
var ChatStore = useChatStore()
var router = useRouter()
</script>

<template>
    <div class="w-full h-full px-10 pb-14 flex flex-col overflow-hidden">
        <h1 class="h-14 flex items-center text-2xl gap-2">
            <button @click="router.go(-1)" class="w-10 h-10 flex items-center justify-center p-2 border rounded hover:bg-gray-200 transition-all">
                <el-icon size="24">
                    <ArrowLeftBold />
                </el-icon>
            </button>
            <span class="flex items-center ">设置</span>
        </h1>
        <div class="border mt-2 w-full h-full rounded-lg overflow-auto shadow divide-y">
            <div class="flex justify-between items-center h-14 w-full  p-2">
                <div class="h-14 flex items-center justify-center">字体大小</div>
                <div class="h-10 w-[200px] px-4 flex items-center justify-center border rounded gap-2">
                    <span class="w-[40px]">{{ PageConfig.fontSize }}</span>
                    <el-slider :min="12" :max="40" :change="PageConfig.setFontSize(PageConfig.fontSize)" v-model="PageConfig.fontSize" />
                </div>
            </div>
            <div class="flex justify-between items-center h-14 w-full  p-2">
                <div class="h-14 flex items-center justify-center">随机性(temperature)</div>
                <div class="h-10 w-[200px] px-4 flex items-center justify-center border rounded gap-2">
                    <span class="w-[40px]">{{ ChatStore.chatConfig.temperature }}</span>
                    <el-slider :min="0" :max="2" :step="0.1" :change="ChatStore.setChatConfig('temperature', ChatStore.chatConfig.temperature)" v-model="ChatStore.chatConfig.temperature" />
                </div>
            </div>
            <div class="flex justify-between items-center h-14 w-full  p-2">
                <div class="h-14 flex items-center justify-center">核采样(top_p)</div>
                <div class="h-10 w-[200px] px-4 flex items-center justify-center border rounded gap-2">
                    <span class="w-[40px]">{{ ChatStore.chatConfig.top_p }}</span>
                    <el-slider :min="0" :max="1" :step="0.1" :change="ChatStore.setChatConfig('top_p', ChatStore.chatConfig.top_p)" v-model="ChatStore.chatConfig.top_p" />
                </div>
            </div>
            <div class="flex justify-between items-center h-14 w-full  p-2">
                <div class="h-14 flex items-center justify-center">单次回复限制(max_tokens)</div>
                <div class="h-10 w-[200px] px-4 flex items-center justify-center">
                    <el-input-number v-model="ChatStore.chatConfig.max_tokens" :min="1" :change="ChatStore.setChatConfig('max_tokens', ChatStore.chatConfig.max_tokens)" />
                </div>
            </div>
            <div class="flex justify-between items-center h-14 w-full  p-2">
                <div class="h-14 flex items-center justify-center">话题新鲜度(presence_penalty)</div>
                <div class="h-10 w-[200px] px-4 flex items-center justify-center border rounded gap-2">
                    <span class="w-[40px]">{{ ChatStore.chatConfig.presence_penalty }}</span>
                    <el-slider :min="-2" :max="2" :step="0.1" :change="ChatStore.setChatConfig('presence_penalty', ChatStore.chatConfig.presence_penalty)" v-model="ChatStore.chatConfig.presence_penalty" />
                </div>
            </div>
            <div class="flex justify-between items-center h-14 w-full  p-2">
                <div class="h-14 flex items-center justify-center">频率惩罚度(frequency_penalty)</div>
                <div class="h-10 w-[200px] px-4 flex items-center justify-center border rounded gap-2">
                    <span class="w-[40px]">{{ ChatStore.chatConfig.frequency_penalty }}</span>
                    <el-slider :min="-2" :max="2" :step="0.1" :change="ChatStore.setChatConfig('frequency_penalty', ChatStore.chatConfig.frequency_penalty)" v-model="ChatStore.chatConfig.frequency_penalty" />
                </div>
            </div>
            <div class="flex justify-between items-center h-14 w-full  p-2">
                <div class="h-14 flex items-center justify-center">附带历史消息数</div>
                <div class="h-10 w-[200px] px-4 flex items-center justify-center border rounded gap-2">
                    <span class="w-[40px]">{{ PageConfig.historyMessage }}</span>
                    <el-slider :min="0" :max="64" :step="1" :change="PageConfig.setHistoryMessage(PageConfig.historyMessage)" v-model="PageConfig.historyMessage" />
                </div>
            </div>
        </div>
    </div>
</template>
