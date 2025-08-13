import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RMSApp } from '../main.jsx';

describe('Client App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('logs in and shows student results table', async () => {
    vi.spyOn(global, 'fetch').mockImplementation((url, options) => {
      if (url.includes('/api/auth/login')) {
        return Promise.resolve(
          new Response(JSON.stringify({ token: 'T', user: { role: 'student' } }), { status: 200 })
        );
      }
      if (url.includes('/api/auth/me')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ id: 'U1', email: 'alice@example.com', role: 'student', studentId: 'S1', name: 'Alice' }),
            { status: 200 }
          )
        );
      }
      if (url.includes('/api/results/student/')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ results: [{ course: { id: 'C1', code: 'CS101', title: 'Intro' }, percent: 86, letter: 'B+', credits: 3 }], gpa: 3.1 }),
            { status: 200 }
          )
        );
      }
      return Promise.resolve(new Response('{}', { status: 200 }));
    });

    render(<RMSApp />);
    const email = screen.getByPlaceholderText(/email/i);
    const password = screen.getByPlaceholderText(/password/i);
    await userEvent.clear(email);
    await userEvent.type(email, 'alice@example.com');
    await userEvent.clear(password);
    await userEvent.type(password, 'student123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(screen.getByText(/welcome, alice/i)).toBeInTheDocument());
    expect(await screen.findByText(/your results/i)).toBeInTheDocument();
    expect(screen.getByText(/CS101 - Intro/)).toBeInTheDocument();
    expect(screen.getByText(/GPA:/)).toBeInTheDocument();
  });
});


