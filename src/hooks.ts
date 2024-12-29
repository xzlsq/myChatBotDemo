export function resizeTextarea(e: any) {
    var textarea = e.target
    // console.log(textarea.scrollHeight)
    textarea.style.height = 'auto'; // 先重置高度
    if (textarea.scrollHeight <= 200) {
        textarea.classList.add('overflow-hidden')
        textarea.classList.remove('overflow-auto')
        textarea.style.height = (textarea.scrollHeight) + 'px';
    } else {
        textarea.classList.remove('overflow-hidden')
        textarea.classList.add('overflow-auto')
        textarea.style.height = 200 + 'px';
    }
}
