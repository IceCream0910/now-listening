import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  type: 'list' | 'lyrics' | 'next' | 'pause' | 'play' | 'prev';
}

export default function Icon({ type, ...props }: Props) {
  if (type === 'list')
    return (
      <svg fill="none" viewBox="0 0 16 17" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="3" cy="4" r="1.5" fill="currentColor" />
        <line x1="7" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="3" cy="9" r="1.5" fill="currentColor" />
        <line x1="7" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="3" cy="14" r="1.5" fill="currentColor" />
        <line x1="7" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );

  if (type === 'lyrics')
    return (
      <svg fill="none" viewBox="0 0 18 17" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fill="currentColor" d="m9.67 13.982-2.43 2.474c-.472.471-.79.675-1.145.675-.479 0-.623-.314-.623-1.012v-2.137H5.26c-1.406 0-1.915-.146-2.429-.42a2.877 2.877 0 0 1-1.192-1.192c-.274-.514-.421-1.024-.421-2.429V6.464c0-1.405.147-1.915.421-2.428a2.872 2.872 0 0 1 1.192-1.192c.514-.275 1.023-.421 2.429-.421h7.68c1.406 0 1.915.146 2.429.421a2.86 2.86 0 0 1 1.192 1.192c.274.513.421 1.023.421 2.428v3.477c0 1.405-.147 1.915-.421 2.429a2.866 2.866 0 0 1-1.192 1.192c-.514.274-1.023.42-2.429.42H9.67Zm-.974-.957c.257-.261.608-.408.974-.408h3.27c1.076 0 1.426-.068 1.785-.26.276-.147.484-.356.631-.632.192-.358.26-.709.26-1.784V6.464c0-1.075-.068-1.426-.26-1.784a1.49 1.49 0 0 0-.631-.631c-.359-.192-.709-.26-1.785-.26H5.26c-1.075 0-1.425.068-1.785.26a1.5 1.5 0 0 0-.631.631c-.192.358-.26.709-.26 1.784v3.477c0 1.075.068 1.426.26 1.784.148.276.356.485.631.632.36.192.71.26 1.785.26h.212c.754 0 1.365.611 1.365 1.365v.934l1.859-1.891ZM5.422 8.01c0-.821.67-1.383 1.554-1.383.976 0 1.599.726 1.599 1.634 0 1.73-1.46 2.084-2.242 2.084-.222 0-.381-.148-.381-.329 0-.173.084-.294.372-.364.502-.12 1.005.028 1.274-.491h-.056c-.185.208-.483.242-.771.242-.837 0-1.349-.614-1.349-1.393Zm4.204 0c0-.821.669-1.383 1.553-1.383.976 0 1.6.726 1.6 1.634 0 1.73-1.46 2.084-2.242 2.084-.223 0-.381-.148-.381-.329 0-.173.084-.294.372-.364.502-.12 1.004.028 1.274-.491h-.056c-.186.208-.483.242-.772.242-.837 0-1.348-.614-1.348-1.393Z"></path>

      </svg>
    );

  if (type === 'play')
    return (
      <svg fill="none" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
          d="M18.0425 48.2502C17.371 48.249 16.7113 48.0729 16.1284 47.7394C14.8159 46.9957 14 45.5519 14 43.9846V12.2658C14 10.6941 14.8159 9.25472 16.1284 8.51097C16.7252 8.16801 17.4031 7.99165 18.0913 8.0003C18.7796 8.00896 19.4528 8.20233 20.0408 8.56019L47.1494 24.7871C47.7143 25.1413 48.1801 25.6333 48.5029 26.2168C48.8258 26.8002 48.9951 27.4562 48.9951 28.123C48.9951 28.7899 48.8258 29.4458 48.5029 30.0293C48.1801 30.6128 47.7143 31.1047 47.1494 31.4589L20.0364 47.6902C19.4347 48.0539 18.7456 48.2475 18.0425 48.2502Z"
          fill="currentColor"
        />
      </svg>
    );

  if (type === 'pause')
    return (
      <svg fill="none" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
          d="M22.75 47.25H17.5C17.0359 47.25 16.5908 47.0656 16.2626 46.7374C15.9344 46.4092 15.75 45.9641 15.75 45.5V10.5C15.75 10.0359 15.9344 9.59075 16.2626 9.26256C16.5908 8.93437 17.0359 8.75 17.5 8.75H22.75C23.2141 8.75 23.6592 8.93437 23.9874 9.26256C24.3156 9.59075 24.5 10.0359 24.5 10.5V45.5C24.5 45.9641 24.3156 46.4092 23.9874 46.7374C23.6592 47.0656 23.2141 47.25 22.75 47.25ZM38.5 47.25H33.25C32.7859 47.25 32.3408 47.0656 32.0126 46.7374C31.6844 46.4092 31.5 45.9641 31.5 45.5V10.5C31.5 10.0359 31.6844 9.59075 32.0126 9.26256C32.3408 8.93437 32.7859 8.75 33.25 8.75H38.5C38.9641 8.75 39.4092 8.93437 39.7374 9.26256C40.0656 9.59075 40.25 10.0359 40.25 10.5V45.5C40.25 45.9641 40.0656 46.4092 39.7374 46.7374C39.4092 47.0656 38.9641 47.25 38.5 47.25Z"
          fill="currentColor"
        />
      </svg>
    );

  if (type === 'next')
    return (
      <svg fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
          d="M37.6008 17.9273L22.8453 9.09921C22.4803 8.8771 22.0623 8.7571 21.635 8.75174C21.2078 8.74638 20.7869 8.85586 20.4164 9.06874C20.0144 9.30284 19.6815 9.63914 19.4515 10.0435C19.2216 10.4479 19.1027 10.9059 19.107 11.3711V17.5469L4.98828 9.09687C4.62324 8.87476 4.20526 8.75475 3.77799 8.74939C3.35073 8.74403 2.92987 8.85352 2.55937 9.0664C2.15737 9.30049 1.82449 9.6368 1.59451 10.0412C1.36454 10.4455 1.24568 10.9036 1.25 11.3687V28.6344C1.24554 29.0997 1.36434 29.5579 1.59432 29.9624C1.82429 30.3669 2.15726 30.7033 2.55937 30.9375C2.92987 31.1504 3.35073 31.2599 3.77799 31.2545C4.20526 31.2491 4.62324 31.1291 4.98828 30.907L19.107 22.4531V28.6312C19.102 29.0971 19.2206 29.5559 19.4506 29.961C19.6806 30.3661 20.0138 30.7031 20.4164 30.9375C20.7869 31.1504 21.2078 31.2599 21.635 31.2545C22.0623 31.2491 22.4803 31.1291 22.8453 30.907L37.6008 22.0789C37.9516 21.8592 38.2408 21.5539 38.4412 21.1918C38.6417 20.8296 38.7469 20.4225 38.7469 20.0086C38.7469 19.5947 38.6417 19.1875 38.4412 18.8254C38.2408 18.4633 37.9516 18.158 37.6008 17.9383V17.9273Z"
          fill="currentColor"
        />
      </svg>
    );

  if (type === 'prev')
    return (
      <svg fill="none" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path
          d="M2.39922 22.0727L17.1547 30.9008C17.5197 31.1229 17.9377 31.2429 18.365 31.2483C18.7922 31.2536 19.2131 31.1441 19.5836 30.9313C19.9856 30.6972 20.3185 30.3609 20.5485 29.9565C20.7784 29.5521 20.8973 29.0941 20.893 28.6289L20.893 22.4531L35.0117 30.9031C35.3768 31.1252 35.7947 31.2452 36.222 31.2506C36.6493 31.256 37.0701 31.1465 37.4406 30.9336C37.8426 30.6995 38.1755 30.3632 38.4055 29.9588C38.6355 29.5545 38.7543 29.0964 38.75 28.6313L38.75 11.3656C38.7545 10.9003 38.6357 10.4421 38.4057 10.0376C38.1757 9.6331 37.8427 9.29667 37.4406 9.06251C37.0701 8.84962 36.6493 8.74014 36.222 8.7455C35.7947 8.75086 35.3768 8.87087 35.0117 9.09298L20.893 17.5469L20.893 11.3688C20.898 10.9029 20.7795 10.4441 20.5494 10.039C20.3194 9.63385 19.9862 9.29692 19.5836 9.06251C19.2131 8.84962 18.7922 8.74014 18.365 8.7455C17.9377 8.75086 17.5197 8.87086 17.1547 9.09297L2.39922 17.9211C2.04844 18.1408 1.75924 18.4461 1.55877 18.8082C1.3583 19.1704 1.25313 19.5775 1.25313 19.9914C1.25313 20.4053 1.3583 20.8125 1.55877 21.1746C1.75924 21.5367 2.04844 21.842 2.39922 22.0617L2.39922 22.0727Z"
          fill="currentColor"
        />
      </svg>
    );

  if (type === 'text')
    return (
      <svg fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M3 5h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 9h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M3 13h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  return null;
}
