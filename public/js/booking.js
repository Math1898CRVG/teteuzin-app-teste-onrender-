const form = document.querySelector("form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.querySelector("#name").value;
    const telefone = document.querySelector("#phone").value;
    const servico = document.querySelector("#service").value;
    const data = document.querySelector("#date").value;
    const horario = document.querySelector("#time").value;

    try {
        const resposta = await fetch("https://teteuzin-app-teste-onrender.onrender.com/agendamentos", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(
                {
                nome, 
                telefone, 
                servico, 
                data,
                horario
            })
        });

        const resultado = await resposta.text();

        alert(resultado)

    } catch (error) {
        alert("Erro ao enviar o agendamento" + error);
    }
});