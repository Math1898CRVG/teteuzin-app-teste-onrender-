// Importando biblioteca express
import express from "express";
import Agendamento from "./agendamentos.js";
import cors from "cors";

const app = express();

app.use(cors());

// Middleware para ler JSON do corpo da requisição
app.use(express.json());

// GET - Consulta os dados cadastrados
app.get ("/agendamentos", async (req, res)=>{
    try {
        const showAgendamentos = await Agendamento.findAll();
        res.send(showAgendamentos);
    } catch (error) {
        res.send("Erro ao buscar os dados no banco:" + error);
    }
});

// POST - Cadastra novo agendamento
app.post('/agendamentos', async (req, res) => {
    try {
        const { nome, telefone, servico, data, horario } = req.body;

        if (!nome || !telefone || !servico || !data || !horario) {
            return res.status(400).send("Campos obrigatórios faltando.");
        }

        // --------- PARSE DA DATA E HORÁRIO ---------
        const [y, m, d] = data.split('-').map(Number);
        const [hour, minute] = horario.split(':').map(Number);

        const dataHora = new Date(y, m - 1, d, hour, minute, 0);
        const agora = new Date();

        if (isNaN(dataHora.getTime())) {
            return res.status(400).send("Data ou horário inválido.");
        }

        // --------- ANTECEDÊNCIA MÍNIMA DE 1H ---------
        const diffMinAntecedencia = (dataHora - agora) / 1000 / 60;
        if (diffMinAntecedencia < 60) {
            return res.status(400).send("O agendamento deve ser feito com pelo menos 1 hora de antecedência.");
        }

        // --------- BLOQUEIO DE CONFLITO MESMO DIA ---------
        const agendamentosDia = await Agendamento.findAll({
            where: { data }
        });

        const newTotalMin = hour * 60 + minute;

        for (const ag of agendamentosDia) {
            const [h, m] = ag.horario.split(':').map(Number);
            const existingMin = h * 60 + m;

            const diff = Math.abs(newTotalMin - existingMin);

            if (diff < 60) {
                return res.status(409).send("Já existe um agendamento em um horário muito próximo (mínimo 1 hora).");
            }
        }

        // --------- CRIA AGENDAMENTO ---------
        await Agendamento.create({ nome, telefone, servico, data, horario });

        res.send("Agendamento cadastrado com sucesso!");

    } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).send("Horário já reservado.");
        }

        res.status(500).send("Erro ao cadastrar agendamento: " + error);
    }
});

// PATCH — atualiza agendamento existente pelo ID
app.patch("/agendamentos/:id", async (req, res) => {
    try {
        await Agendamento.update(
            {
                nome: req.body.nome,
                telefone: req.body.telefone,
                servico: req.body.servico,
                data: req.body.data,
                horario: req.body.horario
            },
            { where: { id: req.params.id } }
        );
        res.send("Agendamento atualizado com sucesso!");
    } catch (erro) {
        res.send("Erro ao atualizar o agendamento: " + erro);
    }
});

// DELETE — remove um agendamento pelo ID
app.delete("/agendamentos/:id", async (req, res) => {
    try {
        await Agendamento.destroy({
            where: { id: req.params.id }
        });
        res.send("Agendamento deletado com sucesso!");
    } catch (erro) {
        res.send("Erro ao deletar agendamento: " + erro);
    }
});

app.listen(3000, function(){
    console.log("O servidor está rodando na porta 3000");
});

