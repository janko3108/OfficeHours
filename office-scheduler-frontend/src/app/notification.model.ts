export interface Notification {
  id: number;
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
  visible?: boolean; // new property
}
