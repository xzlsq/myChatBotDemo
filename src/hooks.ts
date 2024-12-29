export function resizeTextarea(e: any) {
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
