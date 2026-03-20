class Motorista {
  constructor(id, nome, cnh, telefone, email) {
    this.id = id;
    this.nome = nome;
    this.cnh = cnh;
    this.telefone = telefone;
    this.email = email;
    this.ativo = true;
    this.dataCadastro = new Date().toISOString().split('T')[0];
  }
}

module.exports = Motorista;
