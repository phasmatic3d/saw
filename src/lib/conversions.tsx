export const toReadableBytes = (bytes: number) => {
    if(bytes < 1024)
        return bytes + " Bytes";
    else if(bytes < 1024 * 1024)
        return Math.round(10 * bytes / 1024) / 10 + " KB";
    else
        return Math.round(10 * bytes / (1024 * 1024)) / 10 + " MB";
}

export const toReadableNumber = (num: number) => {
    if(num < 1000)
        return num + "";
    else if(num < 1000 * 1000)
        return Math.round(10 * num / 1000) / 10 + "K";
    else
        return Math.round(10 * num / (1000 * 1000)) / 10 + "M";
}