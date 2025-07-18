"use client"

import { useState, useEffect, FormEvent } from "react"
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  HelpCircle,
  MessageSquare,
  Bot,
  User,
  Send,
  Loader2,
  ArrowRight,
  Search,
  CheckCircle,
  Clock,
} from "lucide-react"
import { useLanguage } from '@/contexts/language-context'
import { useParams } from 'next/navigation'

interface LangPageProps {
  params: Promise<{ lang: 'en' | 'tr' }>;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export default function FaqPage({ params: paramsPromise }: LangPageProps) {
  const { language } = useLanguage()
  const urlParams = useParams()
  const currentLang = urlParams.lang as string || 'tr'
  const [isVisible, setIsVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [isChatbotDialogOpen, setIsChatbotDialogOpen] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getLocalizedPath = (path: string) => {
    const basePath = path === '/' ? '' : path;
    return `/${currentLang}${basePath}`;
  }

  const faqItems = [
    {
      question: "AnimatePDF nedir ve ne işe yarar?",
      answer: "AnimatePDF, PDF belgelerinizi yükleyerek otomatik olarak Türkçe özetler çıkaran, bu özetlerden animasyon senaryoları, kare görselleri ve seslendirmeler üreten bir yapay zeka uygulamasıdır. Ayrıca, interaktif mini testler, PDF içeriğiyle sohbet ve süreçleri gösteren metinsel akış diyagramları oluşturma imkanı sunar.",
      category: "Genel"
    },
    {
      question: "Hangi tür PDF'leri yükleyebilirim?",
      answer: "Metin tabanlı PDF'ler en iyi sonuçları verir. Çok fazla karmaşık grafik içeren veya taranmış (resim formatında) PDF'lerde metin çıkarımı ve analiz performansı düşebilir. İçeriğin net ve iyi yapılandırılmış olması önemlidir.",
      category: "Kullanım"
    },
    {
      question: "Animasyon senaryosu, görseller ve seslendirme nasıl oluşturuluyor?",
      answer: "PDF'inizden çıkarılan özet, gelişmiş üretken yapay zeka modellerine gönderilir. Bu modeller, özete uygun senaryo adımlarını, sahne açıklamalarını (metafor ve ikon önerileriyle), bu açıklamalara dayalı görselleri (seçtiğiniz stilde) ve karelerin anahtar konuları için seslendirmeleri üretir.",
      category: "Teknoloji"
    },
    {
      question: "Ücretsiz plan ile neler yapabilirim?",
      answer: "Ücretsiz planımızla ayda 5 PDF dönüşümü, temel kalitede animasyonlar, standart ses seslendirme ve 2GB depolama alanı kullanabilirsiniz. Mini testler, PDF sohbeti ve basit akış diyagramları da ücretsiz planda mevcuttur. Başlangıç için ideal bir seçenektir.",
      category: "Fiyatlandırma"
    },
    {
      question: "Pro plan ne kadardır ve hangi ek özellikler sunar?",
      answer: "Pro planımız aylık 29₺ veya yıllık 290₺'dir (%17 indirimli). Pro plan ile sınırsız PDF dönüşümü, HD kalitede animasyonlar, profesyonel seslendirme seçenekleri, 50GB depolama, öncelikli destek ve gelişmiş düzenleme araçları kullanabilirsiniz.",
      category: "Fiyatlandırma"
    },
    {
      question: "Veri gizliliğim nasıl korunuyor?",
      answer: "Yüklediğiniz PDF'ler yalnızca analiz ve içerik üretimi amacıyla geçici olarak işlenir ve sunucularımızda saklanmaz. Üretilen içerikler (özetler, senaryolar vb.) kullanıcı deneyiminiz için geçici olarak tutulabilir, ancak bu veriler de gizlilik politikamız çerçevesinde korunur.",
      category: "Güvenlik"
    },
    {
      question: "Oluşturulan animasyonları/içerikleri indirebilir miyim?",
      answer: "Şu anki sürümde doğrudan animasyon veya tüm içerik paketini indirme özelliği bulunmamaktadır. Animasyonları uygulama üzerinden önizleyebilir ve interaktif özelliklerini kullanabilirsiniz. Kare görselleri genellikle tarayıcı üzerinden sağ tıklayarak kaydedilebilir.",
      category: "Kullanım"
    },
    {
      question: "Bir sorunla karşılaşırsam ne yapmalıyım?",
      answer: "Herhangi bir sorunla karşılaşırsanız, bir hata fark ederseniz veya uygulama hakkında geri bildirimde bulunmak isterseniz, lütfen support@animatepdf.com adresinden bizimle iletişime geçin. Kullanıcı deneyimini iyileştirmek için geri bildirimleriniz bizim için çok değerlidir.",
      category: "Destek"
    }
  ]

  const filteredFaqs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleChatSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!userInput.trim() || isChatLoading) return

    const newMessage: ChatMessage = { sender: 'user', text: userInput }
    setChatMessages(prev => [...prev, newMessage])
    setUserInput('')
    setIsChatLoading(true)

    try {
      // Simulated bot response
      setTimeout(() => {
        const botResponse: ChatMessage = {
          sender: 'bot',
          text: "Bu özellik şu anda geliştirme aşamasındadır. Sorularınız için lütfen yukarıdaki SSS listesini kontrol edin veya destek ekibimizle iletişime geçin."
        }
        setChatMessages(prev => [...prev, botResponse])
        setIsChatLoading(false)
      }, 1000)
    } catch (error) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Üzgünüm, şu anda bir sorun yaşıyorum." }])
      setIsChatLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 right-40 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-orange-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-8">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 animate-pulse">
                <HelpCircle className="w-4 h-4 mr-2" />
                Sıkça Sorulan Sorular
              </Badge>
              </div>

            <h1 className="text-5xl sm:text-6xl font-black text-gray-900 mb-8 leading-tight">
              Merak Ettiklerinizin{" "}
              <span className="relative">
                <span className="text-orange-500 transition-all duration-500 hover:scale-110 inline-block">
                  Cevapları
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-orange-200 -rotate-1 -z-10 animate-pulse"></div>
              </span>{" "}
              Burada
          </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              AnimatePDF hakkında her şeyi burada bulabilirsiniz. Aşağıdaki chatbot'u kullanarak da hızlıca yanıt alabilirsiniz!
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-12">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Sorularınızda arama yapın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-xl"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Dialog open={isChatbotDialogOpen} onOpenChange={setIsChatbotDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="bg-blue-500 hover:bg-blue-600 text-white h-12 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  >
                    <Bot className="w-5 h-5 mr-2" />
                    AI Asistan ile Sohbet
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl h-[600px] flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Bot className="w-5 h-5 text-blue-500" />
                      SSS Asistanı
                    </DialogTitle>
                    <DialogDescription>
                      Sorularınızı yanıtlamak için buradayım. Aşağıdaki SSS listesindeki bilgilere dayanarak cevap verebilirim.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 p-4 border rounded-lg bg-gray-50">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p>Sorularınızı bekliyorum...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {chatMessages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  message.sender === 'user'
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white border'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {message.sender === 'bot' && <Bot className="w-4 h-4 text-blue-500 mt-0.5" />}
                                  {message.sender === 'user' && <User className="w-4 h-4 text-white mt-0.5" />}
                                  <p className="text-sm">{message.text}</p>
                                </div>
                              </div>
                </div>
                          ))}
                          {isChatLoading && (
                            <div className="flex justify-start">
                              <div className="bg-white border p-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <Bot className="w-4 h-4 text-blue-500" />
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span className="text-sm text-gray-500">Yanıt hazırlanıyor...</span>
                </div>
                </div>
              </div>
                          )}
                        </div>
                      )}
                    </ScrollArea>

                    <form onSubmit={handleChatSubmit} className="flex gap-2 mt-4">
                      <Input
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Sorunuzu buraya yazın..."
                        disabled={isChatLoading}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={isChatLoading || !userInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>

              <Link href={getLocalizedPath('/pricing')}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-orange-500 hover:bg-orange-50 h-12 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Fiyatlandırma
                </Button>
              </Link>

              <Link href={getLocalizedPath('/animate')}>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 h-12 px-6 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Hemen Deneyin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { number: "100+", label: "Sık Sorulan Soru", icon: HelpCircle },
              { number: "%98", label: "Çözüm Oranı", icon: CheckCircle },
              { number: "24/7", label: "Destek Hizmeti", icon: Clock },
            ].map((stat, index) => (
              <Card
                key={index}
                className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gray-50 group"
              >
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors duration-300">
                    <stat.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900 mb-6">Sık Sorulan Sorular</h2>
              <p className="text-xl text-gray-600">
                {searchTerm
                  ? `"${searchTerm}" aramanız için ${filteredFaqs.length} sonuç bulundu`
                  : "AnimatePDF hakkında merak ettiklerinizin cevapları"}
              </p>
            </div>

            <Card className="border-0 shadow-xl bg-white">
              <CardContent className="p-8">
                <Accordion type="multiple" className="space-y-4">
                  {filteredFaqs.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-100">
                      <AccordionTrigger className="text-left hover:text-orange-500 transition-colors duration-300 text-lg font-semibold py-6">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="mt-1 text-xs">
                            {item.category}
                          </Badge>
                          <span>{item.question}</span>
              </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 leading-relaxed pb-6">
                        <div className="pl-16">
                          {item.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Sonuç bulunamadı</h3>
                    <p className="text-gray-600 mb-6">
                      Aradığınız terim için herhangi bir sonuç bulunamadı. Lütfen farklı anahtar kelimeler deneyin.
                    </p>
          <Button
                      onClick={() => setSearchTerm("")}
            variant="outline"
                      className="hover:bg-orange-50 hover:border-orange-500"
                    >
                      Tüm SSS'leri Göster
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-white/10 rounded-full animate-float-delayed"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-6">
              Aradığınız Cevabı Bulamadınız mı?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Destek ekibimiz size yardımcı olmaktan mutluluk duyar. 
              <br />
              24/7 canlı destek ile sorularınızı yanıtlıyoruz.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="mailto:support@animatepdf.com">
                <Button
                  size="lg"
                  className="bg-white text-blue-500 hover:bg-gray-100 font-bold h-14 px-8 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Destek Ekibiyle İletişime Geçin
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}