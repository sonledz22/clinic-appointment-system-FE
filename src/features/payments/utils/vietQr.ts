const DEFAULT_BANK_ID = '970422';
const DEFAULT_ACCOUNT_NO = '999842234';
const DEFAULT_ACCOUNT_NAME = 'TEN CHU TAI KHOAN';

const getEnvValue = (value: string | undefined, fallback: string) => {
  const normalized = value?.trim();
  return normalized || fallback;
};

export const buildVietQrTransferContent = (paymentId: string) =>
  `PAY${paymentId.replaceAll('-', '').slice(0, 8).toUpperCase()}`;

export function buildVietQrUrl(amount: number, paymentId: string): string {
  const bankId = getEnvValue(import.meta.env.VITE_PAYMENT_BANK_ID, DEFAULT_BANK_ID);
  const accountNo = getEnvValue(import.meta.env.VITE_PAYMENT_ACCOUNT_NO, DEFAULT_ACCOUNT_NO);
  const accountName = getEnvValue(import.meta.env.VITE_PAYMENT_ACCOUNT_NAME, DEFAULT_ACCOUNT_NAME);

  const params = new URLSearchParams({
    amount: Math.round(amount).toString(),
    addInfo: buildVietQrTransferContent(paymentId),
    accountName,
  });

  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?${params.toString()}`;
}
