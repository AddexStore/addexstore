package com.addexstores.validation;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringWriter;
import java.util.Locale;
import java.util.Set;

/**
 * Strict whitelist-based SVG sanitizer used to neutralize stored XSS vectors
 * before icon markup is persisted. Only basic, presentational SVG elements and
 * attributes survive; scripts, event handlers, external references, styles and
 * foreign content are removed entirely.
 */
public final class SvgSanitizer {

    private static final Set<String> ALLOWED_TAGS = Set.of(
            "svg", "g", "path", "circle", "rect", "line", "polyline", "polygon",
            "ellipse", "defs", "use", "symbol", "marker", "linearGradient",
            "radialGradient", "stop", "clipPath", "mask", "pattern", "filter",
            "feGaussianBlur", "feOffset", "feBlend", "feColorMatrix", "feMerge",
            "feMergeNode", "feFlood", "feComposite", "text", "tspan", "desc", "title"
    );

    private static final Set<String> ALLOWED_ATTRS = Set.of(
            "viewBox", "viewbox", "d", "cx", "cy", "r", "rx", "ry", "x", "y",
            "x1", "y1", "x2", "y2", "width", "height", "points", "fill",
            "fill-rule", "fillRule", "fill-opacity", "fillOpacity", "stroke",
            "stroke-width", "strokeWidth", "stroke-opacity", "strokeOpacity",
            "stroke-linecap", "strokeLinecap", "stroke-linejoin", "strokeLinejoin",
            "stroke-dasharray", "strokeDasharray", "stroke-dashoffset", "strokeDashoffset",
            "stroke-miterlimit", "strokeMiterlimit", "opacity", "transform",
            "offset", "stop-color", "stopColor", "stop-opacity", "stopOpacity",
            "clip-rule", "clipRule", "clip-path", "clipPath",
            "mask", "filter", "class", "id", "version"
    );

    private static final Set<String> FORBIDDEN = Set.of(
            "script", "foreignobject", "iframe", "object", "embed", "a", "image", "audio", "video"
    );

    private static final String FORBIDDEN_TOKENS = "javascript:vbscript:expression(onload|onerror|onclick|onmouseover|onfocus|onblur|onchange|onkeydown|onkeyup|onkeypress|onanimation|ontransition|onpointer|ontouch|ongesture|ondrag|ondrop|onpaste|oncopy|oncut|onscroll|onwheel|oncontextmenu|onauxclick|ondblclick|onmousedown|onmouseup|onmousemove|onmouseout|onmouseenter|onmouseleave|onresize|oninput|oninvalid|onsubmit|onreset|onselect|onsearch|ontoggle)";

    private SvgSanitizer() {
    }

    public static boolean looksLikeSvg(String value) {
        if (value == null) {
            return false;
        }
        String trimmed = value.trim();
        if (trimmed.length() < 5) {
            return false;
        }
        String lower = trimmed.toLowerCase(Locale.ROOT);
        if (lower.contains(FORBIDDEN_TOKENS)) {
            return false;
        }
        return lower.contains("<svg");
    }

    /**
     * Sanitizes an inline SVG string. Returns the sanitized markup, or an empty
     * string when the input is not safe SVG markup.
     */
    public static String sanitize(String svg) {
        if (svg == null || svg.isBlank()) {
            return "";
        }
        String trimmed = svg.trim();
        if (!looksLikeSvg(trimmed)) {
            return "";
        }
        if (containsForbiddenContent(trimmed)) {
            return "";
        }

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(false);
            factory.setExpandEntityReferences(false);
            factory.setXIncludeAware(false);
            factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");

            DocumentBuilder builder = factory.newDocumentBuilder();
            Document document = builder.parse(new java.io.ByteArrayInputStream(trimmed.getBytes(java.nio.charset.StandardCharsets.UTF_8)));

            sanitizeNode(document.getDocumentElement());
            removeEmptyContainerNodes(document.getDocumentElement());

            return serialize(document.getDocumentElement());
        } catch (Exception e) {
            return "";
        }
    }

    private static void sanitizeNode(Node node) {
        NodeList children = node.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            if (child.getNodeType() == Node.ELEMENT_NODE) {
                Element element = (Element) child;
                String tag = element.getTagName().toLowerCase(Locale.ROOT);
                if (!ALLOWED_TAGS.contains(tag)) {
                    element.getParentNode().removeChild(element);
                    i--;
                    continue;
                }
                sanitizeAttributes(element);
                sanitizeNode(element);
            } else if (child.getNodeType() == Node.COMMENT_NODE) {
                node.removeChild(child);
                i--;
            }
        }
    }

    private static void sanitizeAttributes(Element element) {
        java.util.List<String> toRemove = new java.util.ArrayList<>();
        for (int i = 0; i < element.getAttributes().getLength(); i++) {
            Node attr = element.getAttributes().item(i);
            String rawName = attr.getNodeName();
            String lower = rawName.toLowerCase(Locale.ROOT);

            if (lower.startsWith("on") || lower.contains("javascript:") || lower.contains("vbscript:") || lower.contains("expression(")) {
                toRemove.add(rawName);
                continue;
            }
            if (rawName.equalsIgnoreCase("xmlns") || rawName.equalsIgnoreCase("xmlns:xlink") || rawName.equalsIgnoreCase("xmlns:xhtml") || rawName.equalsIgnoreCase("xmlns:svg")) {
                toRemove.add(rawName);
                continue;
            }
            if (lower.equals("href") || lower.equals("xlink:href") || lower.equals("xlinkhref") || lower.equals("src") || lower.equals("style") || lower.equals("formaction")) {
                toRemove.add(rawName);
                continue;
            }

            if (!ALLOWED_ATTRS.contains(rawName)) {
                toRemove.add(rawName);
            }
        }
        for (String name : toRemove) {
            element.removeAttribute(name);
        }
    }

    private static void removeEmptyContainerNodes(Node node) {
        NodeList children = node.getChildNodes();
        for (int i = 0; i < children.getLength(); i++) {
            Node child = children.item(i);
            if (child.getNodeType() == Node.ELEMENT_NODE) {
                if (child.getChildNodes().getLength() == 0 && !hasTextContent(child)) {
                    String tag = child.getNodeName().toLowerCase(Locale.ROOT);
                    if (isContainerTag(tag)) {
                        child.getParentNode().removeChild(child);
                        i--;
                        continue;
                    }
                }
                removeEmptyContainerNodes(child);
            }
        }
    }

    private static boolean hasTextContent(Node node) {
        for (int i = 0; i < node.getChildNodes().getLength(); i++) {
            Node child = node.getChildNodes().item(i);
            if (child.getNodeType() == Node.TEXT_NODE && !child.getNodeValue().isBlank()) {
                return true;
            }
        }
        return false;
    }

    private static boolean isContainerTag(String tag) {
        return "g".equals(tag) || "defs".equals(tag) || "clipPath".equals(tag)
                || "mask".equals(tag) || "symbol".equals(tag) || "marker".equals(tag);
    }

    private static boolean containsForbiddenContent(String svg) {
        String lower = svg.toLowerCase(Locale.ROOT);
        for (String tag : FORBIDDEN) {
            if (lower.contains("<" + tag) || lower.contains("</" + tag)) {
                return true;
            }
        }
        return lower.contains("javascript:") || lower.contains("vbscript:") || lower.contains("expression(");
    }

    private static String serialize(Element root) {
        try {
            TransformerFactory factory = TransformerFactory.newInstance();
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
            factory.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "");
            Transformer transformer = factory.newTransformer();
            transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
            transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
            StringWriter writer = new StringWriter();
            transformer.transform(new DOMSource(root), new StreamResult(writer));
            return writer.toString();
        } catch (Exception e) {
            return "";
        }
    }
}
