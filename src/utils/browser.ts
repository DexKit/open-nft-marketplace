export function getWindowUrl() {
  if (typeof window === 'undefined') {
    return '';
  }

  let protocol = window.location.protocol;
  let hostname = window.location.hostname;
  let port = window.location.port;

  return `${protocol}//${hostname}${port ? ':' + port : ''}`;
}

export function getCurrentUrl() {
  const pathname = window.location.pathname;

  return `${getWindowUrl()}${pathname}`;
}

export function copyToClipboard(textToCopy: string) {
  // navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard api method'
    return navigator.clipboard.writeText(textToCopy);
  } else {
    // text area method
    let textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    // make the textarea out of viewport
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((res, rej) => {
      // here the magic happens
      document.execCommand('copy') ? res(null) : rej();
      textArea.remove();
    });
  }
}
