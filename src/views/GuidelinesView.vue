<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

// Função para voltar à página anterior
const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="guidelines-page">
    <div class="content-card">
      <div class="header">
        <h1>Diretrizes da Comunidade</h1>
        <p class="subtitle">Regras de Publicação e Convivência no UniBrik</p>
      </div>

      <div class="guidelines-body">
        <p class="intro">
          Bem-vindo ao nosso Marketplace Universitário! Este é um espaço colaborativo feito para facilitar a vida acadêmica, promovendo a compra, venda e troca de itens entre estudantes.
          Para manter nossa comunidade segura, confiável e eficiente, estabelecemos as seguintes diretrizes. <strong>Ao anunciar ou comprar, você concorda com estas regras.</strong>
        </p>

        <hr class="divider">

        <section>
          <h2>1. O que é PROIBIDO anunciar 🚫</h2>
          <p>Para garantir a segurança e a legalidade das transações, não permitimos a publicação dos seguintes itens e serviços. Anúncios que violem estas regras serão removidos imediatamente e o usuário poderá ser banido.</p>
          
          <div class="rule-group">
            <h3>Itens e Serviços Ilegais ou Perigosos</h3>
            <ul>
              <li><strong>Drogas e substâncias ilícitas:</strong> Qualquer tipo de entorpecente, substância tóxica ou equipamentos relacionados ao uso de drogas.</li>
              <li><strong>Armas e munições:</strong> Armas de fogo, armas brancas (facas de combate), explosivos, fogos de artifício ou acessórios bélicos.</li>
              <li><strong>Produtos roubados:</strong> Itens de origem duvidosa ou sem comprovação de propriedade (quando solicitada).</li>
              <li><strong>Medicamentos e produtos de saúde:</strong> Remédios (com ou sem receita), suplementos sem registro na ANVISA ou equipamentos médicos de uso restrito.</li>
            </ul>
          </div>

          <div class="rule-group">
            <h3>Animais</h3>
            <p>É estritamente proibida a venda, doação ou troca de qualquer tipo de animal (doméstico, silvestre ou exótico) em nossa plataforma. Recomendamos procurar ONGs especializadas e feiras de adoção.</p>
          </div>

          <div class="rule-group">
            <h3>Alimentos e Perecíveis</h3>
            <p>Por questões sanitárias e de segurança alimentar, não permitimos a venda de alimentos prontos, bebidas ou produtos perecíveis que exijam refrigeração ou condições especiais de armazenamento.</p>
          </div>

          <div class="rule-group warning-bg">
            <h3>🎓 Fraude Acadêmica (Regra Específica Universitária)</h3>
            <ul>
              <li>Venda de trabalhos acadêmicos prontos (TCCs, monografias, artigos).</li>
              <li>Serviços de falsificação de documentos estudantis ou carteirinhas.</li>
              <li>Venda de respostas de provas ou gabaritos sigilosos.</li>
            </ul>
          </div>

          <div class="rule-group">
            <h3>Conteúdo Adulto e Violência</h3>
            <ul>
              <li>Pornografia, brinquedos eróticos ou serviços de acompanhante.</li>
              <li>Itens que promovam discurso de ódio, discriminação, racismo ou violência.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>2. Boas Práticas de Publicação ✅</h2>
          <p>Para manter a organização do feed e a qualidade dos anúncios, observe as seguintes regras:</p>
          <ul class="check-list">
            <li><strong>Spam e Anúncios Repetidos:</strong> Não publique o mesmo anúncio várias vezes em um curto período. Se você precisa dar destaque ao seu item, exclua o antigo antes de criar um novo.</li>
            <li><strong>Itens Fictícios:</strong> É proibido criar anúncios "teste", brincadeiras ou listar itens que você não possui ou não pretende vender.</li>
            <li><strong>Categorização Correta:</strong> Publique seu item na categoria adequada (ex: não anuncie um livro na categoria de eletrônicos).</li>
            <li><strong>Imagens Reais:</strong> Utilize fotos reais do produto. Evite fotos genéricas da internet (stock photos), pois elas diminuem a confiança do comprador.</li>
            <li><strong>Preço Real:</strong> O preço no anúncio deve ser o valor final. Não coloque "R$ 0,00" ou "R$ 1,00" se o item não for uma doação.</li>
          </ul>
        </section>

        <section>
          <h2>3. Segurança e Conduta 🛡️</h2>
          <p>O Marketplace Universitário (UniBrik) atua apenas como uma "vitrine" e não intermedeia pagamentos ou envios. A responsabilidade da negociação é inteiramente dos usuários.</p>
          <div class="safety-box">
            <h4>⚠ Dicas de Segurança:</h4>
            <ul>
              <li><strong>Marque encontros no Campus:</strong> Sempre prefira realizar a troca em locais movimentados da universidade (praça de alimentação, biblioteca, pátio central).</li>
              <li><strong>Evite pagamentos antecipados:</strong> Não faça transferências (PIX) antes de ver o produto em mãos.</li>
              <li><strong>Teste os eletrônicos:</strong> Ao comprar calculadoras, notebooks ou celulares, ligue e teste o aparelho na frente do vendedor.</li>
            </ul>
          </div>
        </section>

        <section>
          <h2>4. Penalidades ⚖️</h2>
          <p>O desrespeito a estas diretrizes pode acarretar:</p>
          <ul>
            <li><strong>Aviso:</strong> Notificação para edição do anúncio.</li>
            <li><strong>Remoção:</strong> Exclusão automática do conteúdo.</li>
            <li><strong>Suspensão ou Banimento:</strong> Bloqueio temporário ou permanente da conta do usuário em casos de reincidência ou infrações graves (como tentativas de golpe ou venda de itens ilegais).</li>
          </ul>
        </section>

        <section class="disclaimer-section">
          <h2>5. Isenção de Responsabilidade (Disclaimer) 📝</h2>
          <p>O <strong>UniBrik</strong> atua exclusivamente como uma plataforma de classificados online, disponibilizando espaço para que estudantes anunciem seus pertences.</p>
          <p>Ao utilizar a plataforma, você compreende e concorda que:</p>
          <ul class="disclaimer-list">
            <li><strong>Não Intermediação:</strong> Nós não participamos, intermediamos ou temos qualquer vínculo com as transações realizadas entre os usuários. Não processamos pagamentos, não realizamos entregas e não gerenciamos estoques.</li>
            <li><strong>Autonomia dos Usuários:</strong> Toda negociação (preço, forma de pagamento, local de entrega e garantia) é de responsabilidade exclusiva do Comprador e do Vendedor.</li>
            <li><strong>Veracidade das Informações:</strong> A plataforma não verifica previamente a veracidade dos anúncios, a qualidade, a legalidade ou o estado de conservação dos produtos ofertados. As informações contidas nos anúncios são de inteira responsabilidade do anunciante.</li>
            <li><strong>Danos e Prejuízos:</strong> O <strong>UniBrik</strong> não se responsabiliza por quaisquer danos diretos, indiretos, prejuízos financeiros, fraudes ou lucros cessantes decorrentes das negociações iniciadas através da nossa plataforma.</li>
            <li><strong>Segurança Pessoal:</strong> Recomendamos cautela em todas as transações. A plataforma não se responsabiliza pela conduta dos usuários fora do ambiente virtual.</li>
          </ul>
        </section>
      </div>

      <div class="actions">
        <button @click="goBack" class="back-btn">Voltar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guidelines-page {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.content-card {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  color: #004451;
  margin-bottom: 0.5rem;
  font-size: 2.2rem;
}

.subtitle {
  color: #0097b2;
  font-weight: 600;
  font-size: 1.1rem;
}

.divider {
  border: none;
  height: 1px;
  background-color: #e0e0e0;
  margin: 2rem 0;
}

.intro {
  color: #555;
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 2rem;
}

h2 {
  color: #004451;
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
  border-left: 5px solid #0097b2;
  padding-left: 1rem;
}

h3 {
  color: #2c3e50;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.rule-group {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f9fcfd;
  border-radius: 8px;
}

.warning-bg {
  background-color: #fff4e6;
  border: 1px dashed #f39c12;
}

ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  color: #444;
}

li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.safety-box {
  background: #e8f6f3;
  padding: 1.5rem;
  border-radius: 10px;
  border-left: 5px solid #27ae60;
}

.safety-box h4 {
  color: #27ae60;
  margin-top: 0;
  margin-bottom: 1rem;
}

.disclaimer-section {
  margin-top: 3rem;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 12px;
  color: #6c757d;
  font-size: 0.95rem;
}

.disclaimer-section h2 {
  border-left-color: #6c757d;
  color: #495057;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
}

.back-btn {
  padding: 12px 30px;
  background-color: #0097b2;
  color: white;
  border: none;
  border-radius: 30px;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(0, 151, 178, 0.2);
}

.back-btn:hover {
  background-color: #007a8f;
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 151, 178, 0.3);
}

@media (max-width: 768px) {
  .content-card {
    padding: 1.5rem;
  }
  
  h1 {
    font-size: 1.8rem;
  }
}
</style>
\