import { Card } from '@/components/ui/Card';
import { ContactForm } from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-bold mb-3">留言联系我</h1>
      <p className="text-gray-600 mb-8">
        有任何问题、合作、或想聊聊，欢迎直接留言。我会在邮箱里回复你。
      </p>

      <Card>
        <ContactForm />
      </Card>
    </div>
  );
}
