<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>M7 Consultas - Documentação da API</title>
    <style>
        @page {
            margin: 0cm 0cm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            background-color: #ffffff;
            color: #333;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .header {
            background-color: #0f172a;
            color: #ffffff;
            padding: 40px 60px;
            text-align: left;
            border-bottom: 4px solid #3b82f6;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 1px;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 14px;
            color: #94a3b8;
        }
        .content {
            padding: 40px 60px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #0f172a;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 15px;
            text-transform: uppercase;
        }
        .endpoint {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .method {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            color: #ffffff;
            background-color: #3b82f6;
            margin-right: 10px;
        }
        .path {
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            color: #1e293b;
            font-weight: bold;
        }
        .description {
            font-size: 13px;
            color: #64748b;
            margin: 10px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th {
            text-align: left;
            font-size: 11px;
            color: #94a3b8;
            text-transform: uppercase;
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        td {
            padding: 8px;
            font-size: 12px;
            border-bottom: 1px solid #f1f5f9;
        }
        .code-block {
            background-color: #1e293b;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 6px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            margin-top: 10px;
            white-space: pre-wrap;
        }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            background-color: #f8fafc;
            padding: 20px 60px;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
        }
        .badge-error {
            background-color: #ef4444;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>M7 CONSULTAS</h1>
        <p>Documentação Técnica da API - Versão 1.0.0</p>
    </div>

    <div class="content">
        <div class="section">
            <div class="section-title">Autenticação</div>
            <p style="font-size: 13px;">A API utiliza autenticação via Token Bearer. Inclua sua chave de API no cabeçalho de todas as requisições:</p>
            <div class="code-block">Authorization: Bearer {SUA_CHAVE_API}</div>
        </div>

        <div class="section">
            <div class="section-title">Endpoints Principais</div>
            
            <div class="endpoint">
                <div>
                    <span class="method">GET</span>
                    <span class="path">/api/v1/consulta/cpf/{cpf}</span>
                </div>
                <p class="description">Consulta completa de dados vinculados a um CPF.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Parâmetro</th>
                            <th>Tipo</th>
                            <th>Obrigatório</th>
                            <th>Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>cpf</td>
                            <td>string</td>
                            <td>Sim</td>
                            <td>CPF apenas números (11 dígitos)</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="endpoint">
                <div>
                    <span class="method">GET</span>
                    <span class="path">/api/v1/consulta/telefone/{telefone}</span>
                </div>
                <p class="description">Localização de proprietário via número de telefone.</p>
                <table>
                    <thead>
                        <tr>
                            <th>Parâmetro</th>
                            <th>Tipo</th>
                            <th>Obrigatório</th>
                            <th>Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>telefone</td>
                            <td>string</td>
                            <td>Sim</td>
                            <td>DDD + Número (apenas números)</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Códigos de Resposta</div>
            <table>
                <thead>
                    <tr>
                        <th>Código</th>
                        <th>Status</th>
                        <th>Descrição</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>200</td>
                        <td>OK</td>
                        <td>Requisição processada com sucesso.</td>
                    </tr>
                    <tr>
                        <td>401</td>
                        <td>Unauthorized</td>
                        <td>Chave de API inválida ou ausente.</td>
                    </tr>
                    <tr>
                        <td>403</td>
                        <td>Forbidden</td>
                        <td>Acesso negado (assinatura inativa).</td>
                    </tr>
                    <tr>
                        <td>429</td>
                        <td>Too Many Requests</td>
                        <td>Limite de requisições excedido.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="footer">
        &copy; {{ date('Y') }} M7 Consultas. Todos os direitos reservados. Confidencial.
    </div>
</body>
</html>
