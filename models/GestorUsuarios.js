const prisma = require('../lib/prisma');
const { hashPassword } = require('../lib/auth');

class GestorUsuarios {
  constructor() {
  }

  async criarUsuario(username, password, nome, email, role = 'MOTORISTA') {
    const passwordHash = await hashPassword(password);
    
    const usuario = await prisma.usuario.create({
      data: {
        username,
        password: passwordHash,
        nome,
        email: email || null,
        role
      }
    });

    const { password: _, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }

  async buscarPorUsername(username) {
    return await prisma.usuario.findUnique({
      where: { username }
    });
  }

  async buscarPorId(id) {
    const usuario = await prisma.usuario.findUnique({
      where: { id }
    });

    if (usuario) {
      const { password: _, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    }
    
    return null;
  }

  async listarUsuarios(apenasAtivos = false) {
    const where = apenasAtivos ? { ativo: true } : {};
    
    const usuarios = await prisma.usuario.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return usuarios.map(({ password: _, ...usuario }) => usuario);
  }

  async atualizarUsuario(id, dados) {
    const dadosAtualizacao = { ...dados };
    delete dadosAtualizacao.password;
    
    try {
      const usuario = await prisma.usuario.update({
        where: { id },
        data: dadosAtualizacao
      });

      const { password: _, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    } catch (error) {
      return null;
    }
  }

  async alterarSenha(id, novaSenha) {
    const passwordHash = await hashPassword(novaSenha);
    
    try {
      await prisma.usuario.update({
        where: { id },
        data: { password: passwordHash }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async desativarUsuario(id) {
    try {
      const usuario = await prisma.usuario.update({
        where: { id },
        data: { ativo: false }
      });

      const { password: _, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    } catch (error) {
      return null;
    }
  }

  async ativarUsuario(id) {
    try {
      const usuario = await prisma.usuario.update({
        where: { id },
        data: { ativo: true }
      });

      const { password: _, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    } catch (error) {
      return null;
    }
  }
}

module.exports = GestorUsuarios;
