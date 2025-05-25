const ContatoPage = () => {
  return (
    <div className="container mx-auto py-16">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl lg:text-6xl font-bold mb-4">Entre em Contato</h1>
        <p className="text-xl lg:text-2xl max-w-2xl mx-auto">
          Fale conosco! A La Bella Karla está sempre pronta para atender você
        </p>
      </section>

      {/* Contact Form (Placeholder) */}
      <section className="max-w-lg mx-auto">
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Nome:
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Seu email"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">
              Mensagem:
            </label>
            <textarea
              id="message"
              rows={4}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Sua mensagem"
            />
          </div>
          <div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Enviar
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ContatoPage
