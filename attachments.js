function isExternal(reference) {
    return reference.indexOf("http://") == 0 || reference.indexOf("https://") == 0;
}

function getTargetForAttachmentOrLink(reference) {
    if (isExternal(reference)) {
        return reference;
    } else {
        return `attachments/${reference}`;
    }
}

module.exports = {getTargetForAttachmentOrLink};
