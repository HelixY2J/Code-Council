import { pineconeIndex } from "@/lib/pincecone";
import { embed } from "ai";
import { google } from "@ai-sdk/google";
import "dotenv/config";

export async function generateEmbedding(text: string) {
    const { embedding } = await embed({
        model: google.embedding("gemini-embedding-001"), // 3072 dimensions, new state of art model as of 14th Jan, 2026
        value: text
    })
    return embedding
}

const CHUNK_SIZE = 4000
const CHUNK_OVERLAP = 600

function chunkFile(content: string) {
    const lines = content.split("\n")
    const chunks: { text: string, startLine: number, endLine: number }[] = []

    let current: string[] = []
    let currentLength = 0
    let startLine = 0

    for (let i = 0; i < lines.length; i++) {
        current.push(lines[i])
        currentLength += lines[i].length + 1

        if (currentLength >= CHUNK_SIZE) {
            chunks.push({ text: current.join("\n"), startLine: startLine + 1, endLine: i + 1 })

            const overlap: string[] = []
            let overlapLength = 0
            let j = current.length - 1
            while (j >= 0 && overlapLength < CHUNK_OVERLAP) {
                overlapLength += current[j].length + 1
                overlap.unshift(current[j])
                j--
            }
            current = overlap
            currentLength = overlapLength
            startLine = i - overlap.length + 1
        }
    }

    if (current.length > 0) {
        chunks.push({ text: current.join("\n"), startLine: startLine + 1, endLine: lines.length })
    }

    return chunks
}

export async function indexCodebase(repoId: string, files: { path: string, content: string }[]) {
    const vectors = []

    for (const file of files) {
        const chunks = chunkFile(file.content)

        for (let index = 0; index < chunks.length; index++) {
            const chunk = chunks[index]
            const content = `File: ${file.path} (lines ${chunk.startLine}-${chunk.endLine})\n\n${chunk.text}`

            try {
                const embedding = await generateEmbedding(content)
                vectors.push({
                    id: `${repoId}-${file.path.replace(/\//g, "-")}-${index}`,
                    values: embedding,
                    metadata: {
                        path: file.path,
                        repoId,
                        content,
                        startLine: chunk.startLine,
                        endLine: chunk.endLine
                    }
                })
            } catch (error) {
                console.error("Failed to generate embedding for chunk", file.path, index, error)
            }
        }
    }

    if (vectors.length > 0) {
        const batchSize = 100;

        for (let i = 0; i < vectors.length; i += batchSize) {
            const batch = vectors.slice(i, i + batchSize)
            await pineconeIndex.upsert({
                records: batch
            })
        }
    }

    console.log("Indexed codebase for repo", repoId, "chunks:", vectors.length)
}

export async function retrieveContext(query: string, repoId: string, topK: number = 5) {
    const embedding = await generateEmbedding(query)

    const results = await pineconeIndex.query({
        vector: embedding,
        filter: { repoId },
        topK,
        includeMetadata: true
    });

    return results.matches.map(match => match.metadata?.content as string).filter(Boolean);
}