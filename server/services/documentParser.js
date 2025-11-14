const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class DocumentParser {
  async parse(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.pdf':
        return await this.parsePDF(filePath);
      case '.docx':
      case '.doc':
        return await this.parseDOCX(filePath);
      case '.txt':
      case '.md':
        return await this.parseText(filePath);
      case '.html':
        return await this.parseHTML(filePath);
      default:
        return await this.parseText(filePath);
    }
  }

  async parsePDF(filePath) {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error(`Error parsing PDF ${filePath}:`, error.message);
      return '';
    }
  }

  async parseDOCX(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error(`Error parsing DOCX ${filePath}:`, error.message);
      return '';
    }
  }

  async parseText(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error(`Error parsing text ${filePath}:`, error.message);
      return '';
    }
  }

  async parseHTML(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      // Simple HTML tag removal
      return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    } catch (error) {
      console.error(`Error parsing HTML ${filePath}:`, error.message);
      return '';
    }
  }
}

module.exports = DocumentParser;
