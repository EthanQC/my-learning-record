'use client';

import { useState } from 'react';
import { submitContact } from '@/lib/api';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  const canSubmit = name.trim() && email.trim() && message.trim() && status !== 'submitting';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('submitting');
    setError('');
    try {
      await submitContact({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        _honey: '', // 蜜罐字段保持为空
      });
      setStatus('success');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : '提交失败，请稍后再试');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input type="text" name="_honey" className="hidden" aria-hidden="true" />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="怎么称呼你"
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="方便回复你的邮箱"
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">留言</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="想聊什么都可以"
          rows={5}
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
        />
      </div>
      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-pink-500 text-white py-2 font-semibold hover:bg-pink-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {status === 'submitting' ? '发送中...' : '发送留言'}
      </button>

      {status === 'success' && (
        <p className="text-sm text-green-600">收到啦，我会尽快回复你。</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-600">提交失败：{error || '请稍后再试'}</p>
      )}
    </form>
  );
}
