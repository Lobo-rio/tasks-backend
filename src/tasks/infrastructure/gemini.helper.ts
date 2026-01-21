import { Logger } from "@nestjs/common";

export class GeminiHelper {
  private readonly logger = new Logger(GeminiHelper.name);
  private readonly maxRetries = 3;
  private readonly initialDelay = 1000; // 1 segundo

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.debug(
          `Tentativa ${attempt}/${this.maxRetries} para: ${operationName}`
        );
        return await operation();
      } catch (error) {
        lastError = error;
        const errorMessage = error?.message || "Erro desconhecido";

        const isTemporaryError =
          errorMessage.includes("503") ||
          errorMessage.includes("429") ||
          errorMessage.includes("overloaded") ||
          errorMessage.includes("rate limit");

        if (!isTemporaryError || attempt === this.maxRetries) {
          // Se não é erro temporário ou é a última tentativa
          this.logger.error(
            `Falha em ${operationName}: ${errorMessage}`,
            error.stack
          );
          break;
        }

        // Calcula delay com backoff exponencial
        const delay = this.initialDelay * Math.pow(2, attempt - 1);
        this.logger.warn(
          `Erro temporário em ${operationName}. Aguardando ${delay}ms antes de tentar novamente...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error(
      `${operationName} falhou após ${this.maxRetries} tentativas. Erro: ${lastError?.message}`
    );
  }
}
