package com.teambook.panorama.domain.book.dto.popularBook;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PopularBookDoc(
        @JsonProperty("bookname") String title,
        String authors,
        String publisher,
        String ranking,
        @JsonProperty("loan_count") String loanCount,
        @JsonProperty("publication_year") String publicationYear,
        @JsonProperty("isbn13") String isbn,
        @JsonProperty("bookImageURL") String bookImageUrl
) {

}
