import { FormEvent, useEffect, useState } from 'react';
import { MOODLE_TOKEN_KEY } from '../../../constants';
import { SettingsSection } from './SettingsSection';

interface DashboardMoodleAuthSectionProps {
    open: boolean;
    onToggleOpen: () => void;
}

export function DashboardMoodleAuthSection({
    open,
    onToggleOpen,
}: DashboardMoodleAuthSectionProps) {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!open) return;

        void chrome.storage.local
            .get([MOODLE_TOKEN_KEY])
            .then((res: Record<string, unknown>) => {
                setConnected(Boolean(res?.[MOODLE_TOKEN_KEY]));
            });
    }, [open]);

    const connect = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formElement = event.currentTarget;
        setLoading(true);
        setMessage('');

        const form = new FormData(formElement);
        const username = String(form.get('username') || '').trim();
        const password = String(form.get('password') || '');

        try {
            if (!username || !password) {
                throw new Error('학번과 비밀번호를 입력하세요');
            }

            const params = new URLSearchParams({
                username,
                password,
                service: 'moodle_mobile_app',
            });
            const res = await fetch('https://ecampus.smu.ac.kr/login/token.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
                cache: 'no-store',
            });
            const data = await res.json();
            if (!data?.token) {
                throw new Error(data?.error || '토큰 발급 실패');
            }

            await chrome.storage.local.set({ [MOODLE_TOKEN_KEY]: data.token });
            formElement.reset();
            setConnected(true);
            setMessage('연결 완료');
        } catch (err) {
            setMessage(err instanceof Error ? err.message : '연결 실패');
        } finally {
            setLoading(false);
        }
    };

    const disconnect = async () => {
        await chrome.storage.local.remove([MOODLE_TOKEN_KEY]);
        setConnected(false);
        setMessage('연결 해제됨');
    };

    return (
        <SettingsSection
            title="eCampus API 연결"
            description="과제, 퀴즈, 자료를 Moodle API로 더 안정적으로 불러옵니다."
            badgeText={connected ? '연결됨' : '토큰 필요'}
            open={open}
            onToggle={onToggleOpen}
        >
            <form className="space-y-3" onSubmit={connect}>
                <input
                    name="username"
                    className="h-10 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 text-[13px] font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-sky-200 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    placeholder="학번"
                    autoComplete="username"
                    disabled={loading}
                />
                <input
                    name="password"
                    className="h-10 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3 text-[13px] font-medium text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-sky-200 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    type="password"
                    placeholder="비밀번호"
                    autoComplete="current-password"
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="h-10 w-full rounded-2xl bg-sky-500 px-3 text-[13px] font-bold text-white transition hover:bg-sky-600 disabled:cursor-default disabled:opacity-60"
                    disabled={loading}
                >
                    {loading ? '연결 중...' : 'API 연결'}
                </button>
            </form>

            {connected ? (
                <button
                    type="button"
                    className="mt-3 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-[13px] font-bold text-zinc-700 transition hover:bg-zinc-50"
                    onClick={() => {
                        void disconnect();
                    }}
                >
                    연결 해제
                </button>
            ) : null}

            {message ? (
                <p className="mt-3 text-[12px] font-medium leading-5 text-zinc-600">
                    {message}
                </p>
            ) : null}
        </SettingsSection>
    );
}
